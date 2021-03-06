import readline = require("readline");
import { Command, Commands, Action, StrictCommands } from "./definitions";
import { parseOptions } from "./option-parser";
import { printCommandHelp, printOverviewHelp } from "./help-gen";
import { parseCommand } from "./command-parser";
import { parseParameters } from "./parameter-parser";
import { commandToStrictCommand } from "./helpers";

export * from "./definitions";

export class CLI {
    private readonly cmdRegistry: StrictCommands = {};
    private readonly readline: readline.ReadLine;
    private delimiter = "$> ";
    private isActive = false;
    private name?: string;
    private info?: string;
    private version?: string;

    constructor(opts: {
        input?: NodeJS.ReadableStream,
        output?: NodeJS.WritableStream
    } = {}) {
        const input = opts.input || process.stdin;
        const output = opts.output || process.stdout;
        this.readline = readline.createInterface(input, output);
        this.readline.pause();
    }

    private async executeCommand(commandStr: string) {
        const pieces = commandStr.split(" ");
        if (pieces[0] === "help") return this.help(pieces.slice(1));
        const command = parseCommand(pieces, this.cmdRegistry);
        if (!command) return this.invalidCommand();
        const options = parseOptions(command.command, command.remainingPieces);
        if (!options) return this.help(pieces);
        const params = parseParameters(command.command, options.remainingPieces);
        if (!params) return this.help(pieces);
        return new Promise(resolve => {
            const prom = command.command.action(params, options.options, resolve);
            if (prom instanceof Promise) {
                prom.then(resolve).catch(e => {
                    console.log(e);
                    resolve();
                });
            }
        });
    }

    private invalidCommand() {
        console.log(`Invalid Command`);
        this.help([]);
    }

    private async prompt(): Promise<string> {
        return new Promise<string>(resolve => {
            this.readline.question(this.delimiter, resolve);
        });
    }

    private startREPL() {
        this.prompt()
        .then(commandStr => this.executeCommand(commandStr))
        .catch(e => console.log(e))
        .then(() => {
            if (this.isActive) this.startREPL();
        });
    }

    private help(commandPieces: string[]): void {
        if (commandPieces.length === 0) {
            printOverviewHelp({
                info: this.info, name: this.name, version: this.version, commands: this.cmdRegistry
            });
            return;
        }

        const commandOpts = parseCommand(commandPieces, this.cmdRegistry);

        if (!commandOpts) return this.help([]);

        printCommandHelp(
            commandPieces.slice(0, commandPieces.length - commandOpts.remainingPieces.length).join(" "),
            commandOpts.command
        );
    }

    /** Set the cli delimiter */
    setDelimiter(delimiter: string) {
        this.delimiter = delimiter;
    }

    /** Register a command */
    command(command: string, opts: Command): void;
    command(command: string, action: Action): void;
    command(command: string, opts: Command | Action): void;
    command(command: string, opts: Command | Action): void {
        this.cmdRegistry[command] = commandToStrictCommand(opts);
    }

    /** Register multiple commands at once (Alias for registerCommands) */
    commands(commands: Commands) {
        this.registerCommands(commands);
    }

    /** Register multiple commands at once */
    registerCommands(commands: Commands) {
        for (const command in commands) {
            this.command(command, commands[command]);
        }
    }

    /** Show the CLI */
    async show() {
        this.readline.resume();
        this.isActive = true;
        this.startREPL();
    }

    /** Hide the cli */
    hide() {
        this.readline.pause();
        this.isActive = false;
    }

    setVersion(val: string) {
        this.version = val;
    }

    setInfo(val: string) {
        this.info = val;
    }

    setName(val: string) {
        this.name = val;
    }

    hasCommand(cmd: string): boolean {
        return !!this.cmdRegistry[cmd];
    }
}
