import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generare JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Creare o aggiornare utente da Google OAuth
export const findOrCreateUser = async (googleProfile) => {
  try {
    let user = await prisma.user.findUnique({
      where: { googleId: googleProfile.id },
    });

    if (user) {
      // Aggiorna utente esistente
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: googleProfile.displayName,
          picture: googleProfile.photos?.[0]?.value,
          lastLogin: new Date(),
        },
      });
    } else {
      // Crea nuovo utente
      user = await prisma.user.create({
        data: {
          googleId: googleProfile.id,
          email: googleProfile.emails?.[0]?.value,
          name: googleProfile.displayName,
          picture: googleProfile.photos?.[0]?.value,
          role: 'USER', // Default role
          lastLogin: new Date(),
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

// Recuperare utente per ID
export const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        picture: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
};

// Verificare token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Registrazione con email e password (crea o aggiorna)
export const registerUser = async (email, password, name, role = 'USER', forceUpdate = false) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    // Se esiste e non è una registrazione forzata, ritorna errore
    if (existingUser && !forceUpdate) {
      throw new Error('Email already registered');
    }

    // Se esiste e forceUpdate è true, aggiorna
    if (existingUser && forceUpdate) {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : existingUser.password;
      const user = await prisma.user.update({
        where: { email },
        data: {
          ...(password && { password: hashedPassword }),
          name: name || existingUser.name,
          role,
        },
      });
      return user;
    }

    // Crea nuovo utente
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    return user;
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
};

// Login con email e password
export const loginUser = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Aggiorna lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return user;
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
};

// Logout (invalidare token - opzionale, dipende da implementazione)
export const logout = async (userId) => {
  return true;
};
