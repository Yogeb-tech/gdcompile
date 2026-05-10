"use client";
import { ChangeEvent, useState } from "react";
import camelCase from "camelcase";
import styles from "./form.module.css";
import { useLatestGodotBranch } from "../hooks/useLatestGodotBranch";

type TargetPlatform = {
  id: number;
  name: "Windows" | "macOS" | "Linux" | "Android" | "iOS" | "Web";
};

interface GodotFlags {
  buildName: string;
  godotVersion: string;
  encryptionKey: string;
  targetPlatforms: TargetPlatform["name"][];
  enable3D: boolean;
}

const platforms: TargetPlatform[] = [
  { id: 1, name: "Windows" },
  { id: 2, name: "macOS" },
  { id: 3, name: "Linux" },
  { id: 4, name: "Android" },
  { id: 5, name: "iOS" },
  { id: 6, name: "Web" },
];

export default function Form() {
  const { data, loading, error } = useLatestGodotBranch();
  const [formData, setFormData] = useState<GodotFlags>({
    buildName: "",
    godotVersion: "",
    encryptionKey: "",
    targetPlatforms: [],
    enable3D: false,
  });

  function handleFormChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    console.log("SUBMISSION:\n" + JSON.stringify(formData, null, 2));
  }

  return (
    <>
      <div className={styles.container}>
        <h1 className="title">GDCompile</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div>
              <label>For Godot Latest:</label>
              <p className="versionDisplay">{data?.branchName}</p>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="buildName">Build Name</label>
            <input
              type="text"
              name="buildName"
              id="buildName"
              onChange={handleFormChange}
              defaultValue="my-godot-template"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="encryptionKey">Encryption Key</label>
            <input
              type="text"
              name="encryptionKey"
              id="encryptionKey"
              onChange={handleFormChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="enable3D">Enable 3D</label>
            <input
              type="checkbox"
              name="enable3D"
              id="enable3D"
              onChange={handleFormChange}
            />
          </div>
          <fieldset className={styles.platformsGrid}>
            <legend>Target Platforms</legend>
            {platforms.map((platform) => (
              <div key={platform.id}>
                <label htmlFor={camelCase(platform.name)}>
                  {platform.name}
                </label>
                <input
                  type="radio"
                  name="targetPlatforms"
                  value={platform.name}
                  onChange={handleFormChange}
                  className="platformItem"
                />
              </div>
            ))}
          </fieldset>

          <button type="submit" onSubmit={handleSubmit}>
            Generate
          </button>
        </form>
      </div>
    </>
  );
}
