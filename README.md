# VisiTrak Expo App Installation Guide — Windows

## 1. Install Git

Install **Git for Windows**.

After installation, open **Command Prompt** or **PowerShell** and check:

```bash
git --version
```

You should see something similar to:

```text
git version 2.x.x
```

---

## 2. Install Node.js and npm

Install the **LTS version of Node.js**.

npm is automatically installed with Node.js.

After installation, close and reopen CMD or PowerShell.

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

You should see something similar to:

```text
v22.x.x
10.x.x
```

Expo's current system requirements include Node.js LTS, and Windows is supported.

---

## 3. Install Expo Go on Your Phone

If you want to run the application on a physical phone, install **Expo Go** on your Android or iPhone.

You don't need to install Expo itself globally on Windows.

The project already contains the Expo package, and you will use:

```bash
npx expo start
```

Expo officially recommends using `npx expo` for the CLI.

---

## 4. Clone the VisiTrak Repository

Open CMD or PowerShell.

Go to your Documents folder:

```bash
cd %USERPROFILE%\Documents
```

Clone the repository:

```bash
git clone https://github.com/lea-labrador/VisiTrak_01.git
```

After cloning, a folder named:

```text
VisiTrak_01
```

will be created.

---

## 5. Enter the Project

Run:

```bash
cd VisiTrak_01
```

Check the files:

```bash
dir
```

You should see files/folders such as:

```text
app
assets
components
data
lib
package.json
package-lock.json
app.json
eas.json
metro.config.js
tsconfig.json
```

This repository is already configured as an Expo application.

---

## 6. Install the Project Dependencies

This is important.

Inside the `VisiTrak_01` folder, run:

```bash
npm install
```

This reads the project's:

```text
package.json
```

and installs the required packages into:

```text
node_modules
```

The repository's own README specifies `npm install` as the first setup step.

---

## 7. Start the Expo Development Server

After `npm install` finishes, run:

```bash
npx expo start
```

Expo will start the development server and display a QR code in the terminal.

You may see something similar to:

```text
Starting project at ...
Metro waiting on ...
› Scan the QR code above with Expo Go
```

---

## 8. Run the App on Your Phone

Make sure your **computer and phone are connected to the same Wi-Fi network**.

Then:

### Android

1. Open **Expo Go**.
2. Scan the QR code shown in the terminal.
3. The VisiTrak app should open.

### iPhone

1. Open the Camera app.
2. Scan the QR code.
3. Tap the Expo link.
4. It should open the project in Expo Go.

Expo's documentation describes scanning the QR code from the development server to open the project on a physical device.

---

## 9. Useful Expo Commands

Start the project:

```bash
npx expo start
```

Start and clear the cache:

```bash
npx expo start -c
```

Show Expo CLI help:

```bash
npx expo -h
```

Check whether Expo packages are compatible:

```bash
npx expo install --check
```

Expo provides `npx expo install` for installing packages using versions compatible with the project's Expo/React Native version.

---

# Complete Installation From Scratch

For a new Windows computer, install:

```text
Git
Node.js LTS
Expo Go on your phone
```

Then run:

```bash
git clone https://github.com/lea-labrador/VisiTrak_01.git

cd VisiTrak_01

npm install

npx expo start
```

Then scan the QR code using **Expo Go**.

---

# If You Already Cloned the Project

You don't need to clone it again.

Go to the project:

```bash
cd %USERPROFILE%\Documents\VisiTrak_01
```

Pull the latest changes:

```bash
git pull
```

If dependencies changed:

```bash
npm install
```

Then start Expo:

```bash
npx expo start
```

---

# If Expo Gives You a Package Version Warning

If you see something like:

```text
Some packages are incompatible with the installed expo version
```

don't immediately run random `npm install` commands.

First run:

```bash
npx expo install --check
```

Expo can check package versions against the Expo version used by the project.

If Expo recommends fixing them, you can use:

```bash
npx expo install --fix
```

---

# Quick Reference

```bash
# Clone
git clone https://github.com/lea-labrador/VisiTrak_01.git

# Enter project
cd VisiTrak_01

# Install dependencies
npm install

# Start Expo
npx expo start
```

**Important:** You do **not** need to run:

```bash
npm install -g expo-cli
```

For this project, use:

```bash
npx expo start
```

which is the current Expo CLI workflow.
