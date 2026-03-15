export interface createUserDto {
    name: string,
    email: string,
    password: string
}

export interface updateUserDto {
    name?: string,
    email?: string,
    password?: string  
}

