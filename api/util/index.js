import * as argon2 from 'argon2';


export const hash = (password) => {
    return argon2.hash(password, {secret: Buffer.from(process.env.PEPPER)});
};


export const compare = (plainText, hash) => {
    return argon2.verify(
        hash,
        plainText,
        {secret: Buffer.from(process.env.PEPPER)}
    );
};