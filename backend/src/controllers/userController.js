import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Errore nel caricamento utenti' });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['USER', 'VIEWER', 'EDITOR', 'ADMIN', 'COACH'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Ruolo non valido' });
    }

    // Prevent downgrading the last admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    if (adminCount === 1 && role !== 'ADMIN') {
      const userToUpdate = await prisma.user.findUnique({ where: { id } });
      if (userToUpdate?.role === 'ADMIN') {
        return res.status(400).json({ error: 'Non puoi rimuovere l\'ultimo admin' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento ruolo' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (adminCount === 1 && userToDelete?.role === 'ADMIN') {
      return res.status(400).json({ error: 'Non puoi eliminare l\'ultimo admin' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Utente eliminato' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione utente' });
  }
};
