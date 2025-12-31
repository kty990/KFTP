function isPackageInstalled(packageName) {
    try {
        require.resolve(packageName);
        // Package is installed, just require it
        return;
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.log(`${packageName} not found. Installing...`);

            try {
                // Detect package manager
                const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
                const hasPnpmLock = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));

                let installCommand;
                if (hasPnpmLock) {
                    installCommand = `pnpm add ${packageName}`;
                } else if (hasYarnLock) {
                    installCommand = `yarn add ${packageName}`;
                } else {
                    installCommand = `npm install ${packageName}`;
                }

                console.log(`Running: ${installCommand}`);
                execSync(installCommand, { stdio: 'inherit' });

                console.log(`${packageName} installed successfully. Restarting application...`);

                // Restart the application
                const args = process.argv.slice(1);
                const { spawn } = require('child_process');

                const child = spawn(process.argv[0], args, {
                    detached: true,
                    stdio: 'inherit'
                });

                child.unref();
                process.exit(0);

            } catch (installErr) {
                console.error(`Failed to install ${packageName}:`, installErr.message);
                process.exit(1);
            }
        } else {
            throw err;
        }
    }
}

module.exports = { isPackageInstalled }