<div align="center">
    <img src="./logo-hq.png" alt="TypeScriptToGdScript" width="256" />
    <h1>
        <p>TypeScriptToGdScript</p>
    </h1>
</div>

---

TypeScriptToGdScript is a **TypeScript to GDScript transpiler for Godot 4**, allowing you to write code in TypeScript and generate native Godot scripts!

Large GDScript projects can become hard to maintain and prone to errors. Writing in TypeScript improves code readability, maintainability, and reliability, while also benefiting from powerful tools like **ESLint**, **Prettier**, and IDE support (such as **Visual Studio Code** and **WebStorm**).

This project makes working with Godot easier, enabling the use of existing Godot APIs simply by declaring them through TypeScript.

## Getting Started

1. **Clone the Repository**

    ```bash
    git clone https://github.com/GeTechG/TypeScriptToGdScript.git
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Build the Project**

    ```bash
    npm run build
    ```

4. **Link the Local Package**

    ```bash
    npm run local-link
    ```

5. **Initialize the Project**

   Open the console in your project folder and initialize the TypeScriptToGdScript (tstgd) project.

    ```bash
    tstgd init
    ```

6. **Configure the Project**

   Update the `tstgd.json` file, specifying the directories for source TypeScript files (`src`) and output GDScript files (`out`):

    ```json
    {
      "src": "src",
      "out": "out"
    }
    ```

7. **Generate Godot Declaration Files** (Optional)

   To enhance your development experience, generate Godot declaration files by running the following command. Be sure to provide the path to the Godot engine's source directory:

    ```bash
    tstgd lib <path to godot source>
    ```

   This step helps integrate TypeScript more seamlessly with Godot's native APIs.


8. **Transpile TypeScript to GDScript**

   Run the transpiler:

    ```bash
    tstgd
    ```

---

Enjoy writing your Godot 4 projects in TypeScript with better tooling and maintenance!
