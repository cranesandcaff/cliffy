/**
 * Required action function. Executed when the user enters the command.
 *
 * parameters is a key value store. Where the key is the parameter label,
 * and the value is the value entered by the user.
 *
 * options is a key value store. Key being the option, value being true if the user
 * specified the option, false otherwise.
 *
 * done is a function to be called inside the action function when the function is complete.
 * As an alternative to calling done, the action may also return a Promise which ends the
 * action when resolved.
 */
export interface Action {
    (parameters: any, options: any, done: () => void): void | Promise<any>;
}

export interface Parameter {
    label: string;
    /** The type to convert the provided value to. Can be a custom converter. */
    type?: "boolean" | "number" | "string" | ((val: string) => any);
    description?: string;
}

interface BaseCommand<T extends Commands> {
    action: Action;

    /** Optional description for documentation */
    description?: string;

    /** An array of options available to the user. The user specifies an option with an @ symbol i.e. @force */
    options?: ({
        option: string;
        description?: string;
    } | string)[];

    /** All the parameters available to the user. See the parameters interface */
    parameters?: Parameter[];

    /** Sub commands of the command. Follows the same interface as Command */
    subcommands?: T;
}

export type Command = BaseCommand<Commands>;
export interface Commands { [command: string]: Command | Action; }

export type StrictCommand = BaseCommand<StrictCommands>;
export interface StrictCommands { [command: string]: StrictCommand; }
