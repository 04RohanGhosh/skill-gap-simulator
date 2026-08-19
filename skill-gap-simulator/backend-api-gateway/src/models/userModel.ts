import { Pool } from 'pg';

// Initialize PostgreSQL pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'skillgap'),
  user: process.env.POSTGRES_USER || 'skillgap_user',
  password: process.env.POSTGRES_PASSWORD || 'skillgap_pass',
});

// User model interface
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

// User model class with methods
export class UserModel {
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Create new user
  static async create(userData: {
    name: string;
    email: string;
    password: string;
    avatar_url?: string;
    is_admin?: boolean;
  }): Promise<User> {
    const {
      name,
      email,
      password,
      avatar_url = '',
      is_admin = false
    } = userData;

    const result = await pool.query(
      `INSERT INTO users (name, email, password, avatar_url, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, password, avatar_url, is_admin]
    );

    return result.rows[0];
  }

  // Update user
  static async update(id: number, updateData: {
    name?: string;
    email?: string;
    avatar_url?: string;
  }): Promise<User> {
    // Build dynamic query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updateData.name);
    }

    if (updateData.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updateData.email);
    }

    if (updateData.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(updateData.avatar_url);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id); // for WHERE clause
    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

// Export the model for backward compatibility
export default {
  findOne: (conditions: { email: string }) => UserModel.findByEmail(conditions.email),
  findById: (id: number | string) => UserModel.findById(typeof id === 'string' ? parseInt(id) : id),
  create: (userData: any) => UserModel.create(userData),
  findByIdAndUpdate: async (id: number | string, updateData: any, options: { new: boolean }) => {
    const user = await UserModel.update(
      typeof id === 'string' ? parseInt(id) : id,
      updateData
    );
    return options.new ? user : null;
  }
};