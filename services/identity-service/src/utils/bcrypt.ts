import bcrypt from 'bcrypt';

const Bcrypt = {
    hash: (password: string, saltRounds: number = 12) => {
      return bcrypt.hash(password, saltRounds);
    },
    compare: (password: string, hash: string) => {
      return bcrypt.compare(password, hash);
    }

};

export default Bcrypt;