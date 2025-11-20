'use strict';

import bcrypt from 'bcrypt';
import { getDb } from './db';

const saltRounds = 10;

class UserModel {
    async create(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const db = getDb();
        const result = await db.collection('users').insertOne({ username, email, password: hashedPassword });
        return result.insertedId;
    }

    async findOneById(id) {
        const db = getDb();
        return await db.collection('users').findOne({ _id: id });
    }

    async findOneByUsername(username) {
        const db = getDb();
        return await db.collection('users').findOne({ username });
    }

    async findOneByEmail(email) {
        const db = getDb();
        return await db.collection('users').findOne({ email });
    }

    async update(id, updateData) {
        const db = getDb();
        await db.collection('users').updateOne({ _id: id }, { $set: updateData });
    }

    async validatePassword(inputPassword, storedHash) {
        return await bcrypt.compare(inputPassword, storedHash);
    }
}

export default new UserModel();