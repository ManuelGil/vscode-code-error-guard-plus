# CodeErrorGuard+

[![GitHub package.json version](https://img.shields.io/github/package-json/v/ManuelGil/vscode-code-error-guard-plus?style=for-the-badge&logo=github)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-error-guard)
[![GitHub Repo stars](https://img.shields.io/github/stars/ManuelGil/vscode-code-error-guard-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-error-guard-plus)
[![GitHub license](https://img.shields.io/github/license/ManuelGil/vscode-code-error-guard-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-error-guard-plus/blob/main/LICENSE)

**Manage the complete lifecycle of generated try/catch structures in Visual Studio Code.**

CodeErrorGuard+ helps developers insert, review, navigate, and remove language-specific try/catch structures while keeping ownership of application code exactly where it belongs: with the developer.

Instead of focusing only on code generation, CodeErrorGuard+ focuses on the entire workflow around error-handling scaffolding.

Whether you are adding temporary protection during a refactor, introducing error handling in legacy code, reviewing generated structures, or cleaning up an entire file before a commit, the extension provides a deterministic and reversible workflow.

![Generated try/catch structures detected and organized in the Explorer view](https://raw.githubusercontent.com/ManuelGil/vscode-code-error-guard-plus/main/images/generated-structures-explorer.png)

*Discover generated structures, navigate directly to them, and clean them up safely when they are no longer needed.*

## Why CodeErrorGuard+?

Adding a try/catch block is easy.

Managing hundreds of them over time is not.

Many tools can generate snippets, but they typically stop there.

CodeErrorGuard+ provides a complete workflow:

- Insert try/catch structures
- Wrap existing code
- Review generated structures
- Navigate generated structures
- Remove generated structures
- Clean up an entire file
- Customize templates
- Work across multiple languages
- Support multi-cursor editing

All while preserving the original code contained inside the generated structure.

## Core Principle

CodeErrorGuard+ follows a simple rule:

> **CodeErrorGuard+ owns structure.
> The user owns code.**

The extension is responsible for the scaffolding it generates.

Your application logic remains yours.

This principle influences every feature:

- Generated structures can be detected later.
- Generated structures can be removed later.
- Wrapped code is preserved.
- Cleanup operations remain predictable.
- Manually written try/catch blocks are left untouched.

The extension does not attempt to rewrite, reinterpret, or refactor user code.

## Insert Try/Catch

The most common workflow is inserting a try/catch structure at the current cursor location.

Place the cursor on a line and run:

```txt
Insert Try/Catch
```

### Before

```javascript
const result = calculate();
```

### After

```javascript
try {
  const result = calculate();
} catch (error) {
  // TODO: handle error
  // TODO: surface or rethrow error
}
```

CodeErrorGuard+ automatically respects the indentation level of the current line, making insertion predictable even inside deeply nested code.

### Nested Example

```javascript
function process() {
  const result = calculate();
}
```

becomes:

```javascript
function process() {
  try {
    const result = calculate();
  } catch (error) {
    // TODO: handle error
    // TODO: surface or rethrow error
  }
}
```

## Wrap Existing Lines

Existing code can be wrapped without manually moving or reformatting content.

Select one or more complete lines and run:

```txt
Insert Try/Catch
```

### Before

```javascript
const x = 10;
const y = 20;
const sum = x + y;
```

### After

```javascript
try {
  const x = 10;
  const y = 20;
  const sum = x + y;
} catch (error) {
  // TODO: handle error
  // TODO: surface or rethrow error
}
```

Selections intentionally operate on complete lines.

This avoids malformed structures and ensures that transformations remain deterministic.

## Review Generated Structures

Generated structures can be discovered and reviewed directly from the explorer view.

This allows you to:

- Inspect generated structures
- Navigate quickly between structures
- Review temporary scaffolding
- Identify cleanup opportunities
- Understand how generated structures are distributed across files

This capability becomes especially useful during large refactors or migration work.

## Remove Generated Try/Catch

Generated structures can be removed as easily as they are created.

Place the cursor anywhere inside a generated structure and run:

```txt
Remove Generated Try/Catch
```

### Before

```javascript
try {
  const result = calculate();
} catch (error) {
  // TODO: handle error
  // TODO: surface or rethrow error
}
```

### After

```javascript
const result = calculate();
```

The generated scaffolding is removed and the wrapped code is restored.

## Remove Generated Structures from an Entire File

Large refactors often leave many temporary structures behind.

Removing them individually can become tedious.

Run:

```txt
Remove Generated Try/Catch Blocks (Current File)
```

CodeErrorGuard+ will:

1. Scan the active document.
2. Detect generated structures.
3. Validate ownership.
4. Remove valid generated structures.
5. Restore the original wrapped code.

This workflow is ideal for:

- Refactoring sessions
- Code reviews
- Migration work
- Temporary debugging
- Experimental error-handling changes

## Generated Structures Only

CodeErrorGuard+ removes only structures it can positively identify as generated by the extension.

Manually written try/catch blocks remain untouched.

This provides an important safety guarantee:

Generated scaffolding can be cleaned up without risking modifications to user-authored error-handling logic.

## Multi-Cursor Support

All major workflows support standard Visual Studio Code multi-cursor editing.

Use multiple cursors to:

### Insert Multiple Structures

```txt
Insert Try/Catch
```

across multiple locations simultaneously.

### Remove Multiple Structures

```txt
Remove Generated Try/Catch
```

from multiple generated structures in a single operation.

This is particularly useful when working with large files or repetitive patterns.

## Supported Languages

CodeErrorGuard+ supports the most common languages used in modern software development:

- JavaScript
- TypeScript
- Python
- Java
- C#
- PHP
- C++
- Ruby
- Dart
- Go

Each language uses a structure that feels natural for that ecosystem.

### JavaScript / TypeScript

```javascript
try {
  // code
} catch (error) {
  // handling
}
```

### Python

```python
try:
    # code
except Exception as error:
    print(error)
```

### Go

```go
defer func() {
    if err := recover(); err != nil {
        fmt.Println(err)
    }
}()
```

## Custom Templates

Teams often have their own conventions for exception handling.

Some prefer logging.

Others prefer rethrowing exceptions.

Some use centralized error-reporting systems.

CodeErrorGuard+ allows generated structures to be customized through Visual Studio Code settings.

Example:

```json
{
  "codeErrorGuardPlus.customTemplates": [
    {
      "language": "python",
      "tryBlock": [
        "{{indent}}try:"
      ],
      "catchBlock": [
        "{{indent}}except Exception as {{errorVar}}:",
        "{{indent}}{{indentUnit}}logger.exception({{errorVar}})"
      ]
    }
  ]
}
```

This makes it easy to align generated structures with project standards without changing your workflow.

## Workspace Support

Projects within the same workspace often require different conventions.

CodeErrorGuard+ supports workspace-aware configuration through:

```txt
Change CodeErrorGuard+ Workspace
```

This allows teams working with multi-root workspaces to choose the configuration that should be applied to generated structures.

## Available Commands

### Insert

- Insert Try/Catch

### Review

- Select Generated Try/Catch Blocks

### Remove

- Remove Generated Try/Catch
- Remove Generated Try/Catch Blocks (Current File)

### Configuration

- Change CodeErrorGuard+ Workspace

## Contributing

CodeErrorGuard+ is open-source and welcomes community contributions:

1. Fork the [GitHub repository](https://github.com/ManuelGil/vscode-code-error-guard-plus).
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes, commit them, and push to your fork.
4. Submit a Pull Request against the `main` branch.

Before contributing, please review the [Contribution Guidelines](https://github.com/ManuelGil/vscode-code-error-guard-plus/blob/main/CONTRIBUTING.md) for coding standards, testing, and commit message conventions. Open an Issue if you find a bug or want to request a new feature.

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all, regardless of gender, sexual orientation, disability, ethnicity, religion, or other personal characteristic. Please review our [Code of Conduct](https://github.com/ManuelGil/vscode-code-error-guard-plus/blob/main/CODE_OF_CONDUCT.md) before participating in our community.

## Changelog

For a complete list of changes, see the [CHANGELOG.md](https://github.com/ManuelGil/vscode-code-error-guard-plus/blob/main/CHANGELOG.md).

## Authors

- **Manuel Gil** - *Owner* - [@ManuelGil](https://github.com/ManuelGil)

See also the list of [contributors](https://github.com/ManuelGil/vscode-code-error-guard-plus/contributors) who participated in this project.

## Follow Me

- **GitHub**: [![GitHub followers](https://img.shields.io/github/followers/ManuelGil?style=for-the-badge\&logo=github)](https://github.com/ManuelGil)
- **X (formerly Twitter)**: [![X Follow](https://img.shields.io/twitter/follow/imgildev?style=for-the-badge\&logo=x)](https://twitter.com/imgildev)

## Other Extensions

- **[Auto Barrel](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-auto-barrel)**
  Automatically generates and maintains barrel (`index.ts`) files for your TypeScript projects.

- **[Angular File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-angular-generator)**
  Generates boilerplate and navigates your Angular (9→20+) project from within the editor, with commands for components, services, directives, modules, pipes, guards, reactive snippets, and JSON2TS transformations.

- **[NestJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nestjs-generator)**
  Simplifies creation of controllers, services, modules, and more for NestJS projects, with custom commands and Swagger snippets.

- **[NestJS Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nestjs-snippets-extension)**
  Ready-to-use code patterns for creating controllers, services, modules, DTOs, filters, interceptors, and more in NestJS.

- **[T3 Stack / NextJS / ReactJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nextjs-generator)**
  Automates file creation (components, pages, hooks, API routes, etc.) in T3 Stack (Next.js, React) projects and can start your dev server from VSCode.

- **[Drizzle ORM Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-drizzle-snippets)**
  Collection of code snippets to speed up Drizzle ORM usage, defines schemas, migrations, and common database operations in TypeScript/JavaScript.

- **[CodeIgniter 4 Spark](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-spark)**
  Scaffolds controllers, models, migrations, libraries, and CLI commands in CodeIgniter 4 projects using Spark, directly from the editor.

- **[CodeIgniter 4 Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-snippets)**
  Snippets for accelerating development with CodeIgniter 4, including controllers, models, validations, and more.

- **[CodeIgniter 4 Shield Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-shield-snippets)**
  Snippets tailored to CodeIgniter 4 Shield for faster authentication and security-related code.

- **[Mustache Template Engine - Snippets & Autocomplete](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-mustache-snippets)**
  Snippets and autocomplete support for Mustache templates, making HTML templating faster and more reliable.

## Recommended Browser Extension

For developers who work with `.vsix` files for offline installations or distribution, the complementary [**One-Click VSIX**](https://chromewebstore.google.com/detail/imojppdbcecfpeafjagncfplelddhigc?utm_source=item-share-cb) extension is recommended, available for both Chrome and Firefox.

> **One-Click VSIX** integrates a direct "Download Extension" button into each VSCode Marketplace page, ensuring the file is saved with the `.vsix` extension, even if the server provides a `.zip` archive. This simplifies the process of installing or sharing extensions offline by eliminating the need for manual file renaming.

- [Get One-Click VSIX for Chrome &rarr;](https://chromewebstore.google.com/detail/imojppdbcecfpeafjagncfplelddhigc?utm_source=item-share-cb)
- [Get One-Click VSIX for Firefox &rarr;](https://addons.mozilla.org/es-ES/firefox/addon/one-click-vsix/)

## License

This project is licensed under the **MIT License**. See the [LICENSE](https://github.com/ManuelGil/vscode-code-error-guard-plus/blob/main/LICENSE) file for details.
