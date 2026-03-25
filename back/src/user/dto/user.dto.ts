export interface createUserDto {
    name: string,
    email: string,
    password: string,
    publicKey?: string,
    encryptedPrivateKey?: string
}

export interface updateUserDto {
    name?: string,
    email?: string,
    password?: string,
    publicKey?: string,
    encryptedPrivateKey?: string,
    isActive?: boolean
}

    