// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "kendoui-generator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('kendoui-generator.gettersandsetters', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		var selection = editor.selection;
        var text = editor.document.getText(selection);

        if (text.length < 1) {
            vscode.window.showErrorMessage('No properties are selected.');
            return;
        }

        try {
            var getterAndSetter = generateGetterAndSetter(text);
            editor.edit(edit => editor.selections.forEach(selection => edit.replace(selection, getterAndSetter)));
            vscode.commands.executeCommand('editor.action.formatSelection');
        } catch (error) {
            vscode.window.showErrorMessage('Something went wrong! Properties must be in this format: "private Name: string;"');
        }
    });

    context.subscriptions.push(disposable);
}

function toPascalCase(str: string) 
{
    return str.replace(/\w+/g,w => w[0].toUpperCase() + w.slice(1));
}

function toCamelCase(str: string) {
    return str.replace(/\w+/g,w => w[0].toLowerCase() + w.slice(1));
}

function generateGetterAndSetter(textProperties: string)
{
    var properties = textProperties.split(/\r?\n/).filter(x => x.length > 2).map(x => x.replace(';', '').trim());

    var generatedCode = "";
    for (let prop of properties) {
        let words = prop.split(" ").map(x => x.trim().replace(/\r?\n/, '').replace(":", ""));
        let attributePascal = "";
        if (words.length > 2) {
			words.shift();
		}
		let [attribute, type] = words;
		attribute = toCamelCase(attribute);
		attributePascal = toPascalCase(attribute);

        let code = 
`public get ${attributePascal}():${type} {
	return this.get("_${attribute}");
}
public set ${attributePascal}(value: ${type}) {
	this.set("_${attribute}", value);
}
`;

        generatedCode += code;
    }

    return generatedCode;
}

// This method is called when your extension is deactivated
export function deactivate() {}
