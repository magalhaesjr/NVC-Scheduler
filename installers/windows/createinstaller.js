const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')
  let cert = "C:/Users/Jeff/nvcscheduler.pfx";
  let pass = "NVCScheduler";
  let ts = "http://timestamp.verisign.com/scripts/timstamp.dll";

  return Promise.resolve({
    appDirectory: path.join(outPath, 'NVC-Scheduler-win32-x64/'),
    authors: 'Jeff Magalhaes',
    signWithParams: "/fd sha256 /f " + cert + " /p " + pass + " /t " + ts ,
    loadingGif: path.join(rootPath,'assets','installer','familyguy_vball.gif'),
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'NVC-Scheduler.exe',
    setupExe: 'InstallScheduler.exe',
    setupIcon: path.join(rootPath, 'assets', 'icons', 'win', 'nvc.ico')
  })
}
