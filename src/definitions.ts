export interface IParameter {
  label: string;
  type?: 'boolean' | 'number' | 'string';
  description?: string;
}

export interface IActionData {
  [parametr: string]: boolean | number | string;
}

export interface ICommand {
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
  action: (parameters: IActionData, options: IActionData) => Promise<any> | void | any;

  /** Optional description for documentation */
  description?: string;

  /** An array of options available to the user. The user specifies an option with an @ symbol i.e. @force */
  options?: Array<{
    option: string;
    description?: string;
  } | string>;

  /** All the parameters available to the user. See the parameters interface */
  parameters?: IParameter[];

  /** Sub commands of the command. Follows the same interface as Command */
  subcommands?: { [command: string]: ICommand };
}

export interface ICommands { [command: string]: ICommand; }
