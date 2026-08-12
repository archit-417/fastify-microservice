import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const userService = {
  async create(collection, data) {
    const existing = await collection.findOne({ email: data.email });
    if (existing) {
      const err = new Error('Email already in use');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const doc = { ...data, password: hashedPassword, createdAt: new Date() };
    const result = await collection.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  findAll(collection) {
    return collection.find().toArray();
  },

  findById(collection, id) {
    return collection.findOne({ _id: id });
  },

  update(collection, id, data) {
    return collection.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { returnDocument: 'after' },
    );
  },

  delete(collection, id) {
    return collection.findOneAndDelete({ _id: id });
  },

  // Used internally by auth-service during login. Never expose the
  // password hash outside this method's caller (the controller strips it).
  async verifyCredentials(collection, email, password) {
    const user = await collection.findOne({ email });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
  },
};
