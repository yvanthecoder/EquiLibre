import { User } from '../models/user.model';

declare global {
  namespace Express {
    interface User extends User {}
    
    interface Request {
      user?: User;
    }
  }
}

export {};
