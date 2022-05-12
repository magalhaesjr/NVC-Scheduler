# NVC-Scheduler
An application for generating schedules for Newport Volleyball Club ([NVC](http://www.newportvolleyballclub.com)). The application is written mostly in Javascript using the [Electron](https://electronjs.org) framework to make it a portable web application

# Intallation
An installer is attached to each software [Release](https://github.com/magalhaesjr/NVC-Scheduler/releases). Running the installer will install the scheduler on your computer
- Download an installer from the appropriate release
- Run the installer
>**NOTE: Windows may not trust the application by default (You'll see a "Windows Protected Your PC" message. You can override the smartscreen to proceed with the install. See [Security](https://github.com/magalhaesjr/NVC-Scheduler#Security)**
- Choose an installation directory

# Uninstalling
Once installed, the application is like any other application on your computer. You can uninstall it using the build-in Windows functions
- Click on the Windows icon to launch the `Start Menu`
- Choose `Settings` (the gear icon)
- Select `Apps`
- Select `NVC-Scheduler`
- Choose `Uninstall`

# Issues / Feature Requests
Submit issues or feature requests here ([Issues](https://github.com/magalhaesjr/NVC-Scheduler/issues))

## Major Release 1
The scheduler user interface (UI) is undergoing a migration to the [React](https://reactjs.org) framework. Some issues may be left unresolved until after the release of version 2.0.0, since the existing UI will soon be deprecated

# Security
The installer is signed with a self-signed certificate to verify its integrity. The certificate is not registered in Windows trust authority, and as such will not be trusted by Windows by default. For the privilige of being trusted, Microsoft charges ~$500 per year... Not money well spent for such a specialized application. To override the smartscreen filter
- Click on `More Info`
- Click on `Run Anyway`

## Verify the Installer
If you wish to verify the integrity of the executable you downloaded, you can verify the file integrity by checking the file size and hashes vs the published attributes on the release page
- Press <kbd>Windows</kbd> + <kbd>r</kbd>
- Type `cmd` and click `Ok`
- cd into the directory with the file
```shell
cd C:/Users/{your user name}/Downloads
```
- Use the `dir` command to get the file size in bytes
```shell
# Replace the x.x.x with release number
dir "NVC-Scheduler.Setup.x.x.x.exe"
```
- Show the MD5 hash of the installer using the `certutil` command
```shell
# Replace the x.x.x with release number
certutil -hashfile "NVC-Scheduler.Setup.x.x.x.exe" MD5
```
- Show the SHA256 hash of the installer using the `certutil` command
```shell
# Replace the x.x.x with release number
certutil -hashfile "NVC-Scheduler.Setup.x.x.x.exe" SHA256
```


