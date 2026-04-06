---
title: "Installing n8n on Termux and Accessing from Windows"
date: 2025-01-15
description: "A step-by-step guide to installing n8n on Android using Termux and accessing it from a Windows machine on the same local network."
tags: ["n8n", "termux", "android", "automation", "tutorial"]
---

This guide walks you through installing [n8n](https://n8n.io/) on Android using Termux and configuring it to be accessible from a Windows machine on the same local network. 

## Prerequisites
* An Android device with **Termux** installed (preferably from F-Droid or GitHub, not the Play Store).
* A Wi-Fi connection (both the Android device and Windows machine must be on the same network).
* Basic familiarity with the command line.

---

## Step 1: Update Termux and Install Essential Packages
Open Termux and run the following commands to ensure your environment is up to date and has the necessary build tools:

```bash
pkg update && pkg upgrade -y
pkg install binutils clang make python pkg-config libsqlite
```

**Package Breakdown:**
* `binutils` – Linker and binary tools.
* `clang` – C compiler.
* `make` – Build automation tool.
* `python` – Required for `node-gyp`.
* `pkg-config` – Helps locate libraries.
* `libsqlite` – SQLite headers and libraries (needed for the `sqlite3` native module).

## Step 2: Install Node.js 22
Termux's default `nodejs` package may be too new for certain dependencies. We will install `nodejs-22` from the Termux User Repository (TUR).

```bash
pkg install tur-repo -y
pkg update
pkg install nodejs-22 -y
```

### Create Symlinks for Node, NPM, and NPX
The `nodejs-22` package installs binaries in `/usr/opt/nodejs-22/bin/`. Create symlinks so they are accessible in your `$PATH`:

```bash
ln -sf /data/data/com.termux/files/usr/opt/nodejs-22/bin/node /data/data/com.termux/files/usr/bin/node
ln -sf /data/data/com.termux/files/usr/opt/nodejs-22/bin/npm /data/data/com.termux/files/usr/bin/npm
ln -sf /data/data/com.termux/files/usr/opt/nodejs-22/bin/npx /data/data/com.termux/files/usr/bin/npx
```

**Verify the installation:**
```bash
node --version # Should show v22.22.1 or similar
npm --version
```

## Step 3: Configure node-gyp for Termux
Native modules (like `sqlite3`) need a small configuration tweak to avoid the `android_ndk_path` error during installation.

```bash
mkdir -p ~/.gyp
cat > ~/.gyp/include.gypi << 'EOF'
{
  'variables': {
    'android_ndk_path': ''
  }
}
EOF
```

Set the environment variables (these help the build process):
```bash
export GYP_DEFINES="android_ndk_path="
export npm_config_android_ndk_path=""
```
*(Tip: You can add these export lines to your `~/.bashrc` to make them permanent.)*

## Step 4: Install n8n
Now, install n8n globally. The `--unsafe-perm` flag helps avoid permission issues during the execution of install scripts.

```bash
npm cache clean --force
npm install -g n8n --unsafe-perm
```
*Note: This may take several minutes. You will likely see warnings regarding peer dependencies or deprecations—these are harmless as long as the final installation finishes successfully.*

## Step 5: Start n8n for Network Access
By default, n8n only listens on `localhost` and requires secure cookies. To access it from your Windows laptop, we need to bind it to all network interfaces and disable the secure cookie requirement.

Run the following command to start the server:
```bash
N8N_SECURE_COOKIE=false n8n start --host=0.0.0.0
```

## Step 6: Find Your Android Device's IP Address
Open a new Termux session (swipe left and click "New session") or stop the server temporarily, and run:

```bash
ifconfig
# OR
ip addr show
```
Look for the `wlan0` interface (your Wi-Fi connection). Note down the IP address (it usually looks something like `192.168.x.x` or `10.0.x.x`).

## Step 7: Access n8n from Windows
1. On your Windows laptop, open a web browser.
2. Navigate to `http://<ANDROID_IP>:5678` (replace `<ANDROID_IP>` with the address you found in Step 6). 
   * *Example:* `http://192.168.1.100:5678`

You should now see the n8n interface. 

---

## Optional: Make the Settings Permanent
If you want to easily start n8n without typing the environment variables every time, add them to your shell configuration:

1. Open your bash configuration:
```bash
echo "export N8N_SECURE_COOKIE=false" >> ~/.bashrc
```
2. Reload the configuration:
```bash
source ~/.bashrc
```
3. From now on, you can just start n8n with:
```bash
n8n start --host=0.0.0.0
```

---

## Troubleshooting

* **`node: command not found`**: Ensure the symlinks were created correctly in Step 2 and that your `PATH` includes `/data/data/com.termux/files/usr/bin`.
* **Build errors for `sqlite3`**: Double-check that all build tools (`binutils`, `clang`, `make`, `python`) are installed and the `~/.gyp/include.gypi` file is formatted correctly.
* **Cannot access from Windows**: 
  * Verify the IP address is correct.
  * Ensure both devices are connected to the exact same Wi-Fi network.
  * Check that your Windows firewall isn't blocking outgoing connections to port `5678`.
  * Ensure n8n is actively listening on `0.0.0.0` (you can check this in Termux by running `netstat -tlnp | grep 5678`).
* **Secure cookie error persists**: Verify that the variable is actually set before starting n8n. Run `echo $N8N_SECURE_COOKIE` to confirm it returns `false`.
