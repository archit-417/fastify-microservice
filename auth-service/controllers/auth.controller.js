import { authService } from '../services/auth.service.js';
import { signToken } from '../utils/jwt.js';

export const authController = {
  async register(request, reply) {
    const user = await authService.register(request.body);
    const token = signToken({ sub: user._id, email: user.email });
    reply.code(201).send({ user, token });
  },

  async login(request, reply) {
    const { email, password } = request.body;
    const user = await authService.login({ email, password });
    if (!user) {
      return reply.code(401).send({ message: 'Invalid email or password' });
    }
    const token = signToken({ sub: user._id, email: user.email });
    reply.send({ user, token });
  },

  async me(request, reply) {
    reply.send({ user: request.user });
  },
};
