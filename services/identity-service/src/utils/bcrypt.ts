import bcrypt from 'bcrypt';

const Bcrypt = {
    hashed :(password: string, saltRounds: number = 12) => {
      return bcrypt.hash(password, saltRounds);
    },
    compared: (password: string, hash: string) => {
      return bcrypt.compare(password, hash);
    }

};

export default Bcrypt;