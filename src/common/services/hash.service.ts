import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";


@Injectable()
export class HashService {
    private readonly salt = 10;

    async hash(value: string) {
        return hash(value, this.salt);
    }

    async verify(plain: string, hashed: string) {
        return compare(plain, hashed);
    }
}