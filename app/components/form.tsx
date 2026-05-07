"use client"
import { ChangeEvent, useState, SubmitEvent } from "react";
import camelCase  from 'camelcase';


type TargetPlatform = {
	id: number;
	name: "Windows" | "macOS" | "Linux" | "Android" | "iOS" | "Web";
}

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

// TODO: Test the form with sample form data
// TODO: Use CSS to layout page correctly

export default function Form() {
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
			[name]: type === 'checkbox' ? checked : value
		})
		console.log(JSON.stringify(formData, null, 2));
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		console.log(JSON.stringify(formData, null, 2))
	}

  	return (<>
		<h1>GDCompile</h1>
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor="godotVersion">Godot Version</label>
				<input type="text" name="godotVersion" id="godotVersion" onChange={handleFormChange}/>
			</div>
			<div>
				<label htmlFor="targetPlatforms">Target Platform</label>
				<input type="text" name="targetPlatforms" id="targetPlatforms" onChange={handleFormChange}/>
			</div>
			<div>
				<label htmlFor="encryptionKey">Encryption Key</label>
				<input type="text" name="encryptionKey" id="encryptionKey" onChange={handleFormChange}/>
			</div>
			<div>
				<label htmlFor="enable3D">Enable 3D</label>
				<input type="checkbox" name="enable3D" id="enable3D" onChange={handleFormChange}/>
			</div>
			<fieldset>
				<legend>Target Platforms</legend>
				{platforms.map(platform =>
					<div key={platform.id}> 
						<label htmlFor={camelCase(platform.name)}>{platform.name}</label>
						<input type="radio" name="targetPlatforms" value={platform.name} onChange={handleFormChange}/>
					</div> 
				)}
			</fieldset>

			<button type="submit">Submit</button>
		</form>
	</>
  );
}
