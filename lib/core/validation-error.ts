class ValidationError<T> extends Error {
    public readonly data: T;

    public constructor(data: T, message: string) {
        super(message);
        this.data = data;
    }
}

namespace ValidationError {
    export class DuplicateTableName extends ValidationError<{name: string}> {
        public constructor(name: string) {
            super({name}, `The name ${name} occurs twice.`);
        }
    }

    export class DuplicateGetterName extends ValidationError<{name: string}> {
        public constructor(name: string) {
            super({name}, `The getter name ${name} occurs twice.`);
        }
    }

    export class DuplicateSetterName extends ValidationError<{name: string}> {
        public constructor(name: string) {
            super({name}, `The setter name ${name} occurs twice.`);
        }
    }

    export class InvalidColumnDefinition extends ValidationError<{name: string}> {
        public constructor(name: string) {
            super({name}, `The column definition with name ${name} does not exist.`);
        }
    }
}

export = ValidationError;
