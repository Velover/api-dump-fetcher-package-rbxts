#Api-dump-fetcher

Fully types MaximumADHD Api-Dump (mostly for plugins)

Saves api-dump in the plugin and auto updates it. 

```ts
interface IGetApiDumpOptions {
	/**@default false */
	Override?: string; //force gets a new version of api dump
	/**@default false */ 
	DontSave?: boolean; //doesnt save to plugin settings
	/**@default API_DUMP*/
	SaveName?: string; //plugin.SetSetting(SaveName, CompressedApiDumpText)
	/**@default API_DUMP_VERSION*/
	VersionSaveName?: string; //plugin.SetSetting(VersionSaveName, StudioVersion)
}

export function GetApiDump(plugin?: Plugin, options?: IGetApiDumpOptions): ApiDumpTypes.IAPIDump;
```

## Recommended usage in plugins
```ts
import { ApiDumpTypes, GetApiDump } from "@rbxts/api-dump-fetcher";

export namespace ApiDumpController {
	let api_dump: ApiDumpTypes.IAPIDump;
	export function Init(plugin: Plugin) {
     //cashes API dump
		api_dump = GetApiDump(plugin);
	}
	export function AwaitApiDump() {
		WaitInitialization();
		return api_dump;
	}
	export function WaitInitialization() {
		while (api_dump === undefined) task.wait();
	}
}

```

## Example usage:

Extracting all classes with propeties that are of type Color3

```ts
import { ApiDumpConstants, GetApiDump } from "@rbxts/api-dump-fetcher";

const api_dump = GetApiDump(plugin);

const class_properties_map = new Map<string, string[]>();

api_dump.Classes.forEach((value) =>
    value.Members.forEach((member) => {
        if (member.MemberType !== ApiDumpConstants.EMemberMemberType.Property) return;
        if (member.ValueType?.Category !== ApiDumpConstants.EMemberValueTypeCategory.DataType) return;
        if (member.ValueType.Name !== ApiDumpConstants.EMemberValueTypeCategoryDataTypeName.Color3)
            return;
        const properties_list =
            class_properties_map.get(value.Name) ??
            class_properties_map.set(value.Name, []).get(value.Name)!;
        properties_list.push(member.Name);
    }),
);

for (const [classname] of class_properties_map) {
    let superclass = classname;
    while (superclass !== ApiDumpConstants.ROOT_SUPER_CLASS) {
        superclass = api_dump.Classes.find((value) => value.Name === superclass)!.Superclass;
        const properties = class_properties_map.get(superclass);
        if (properties === undefined) continue;
        for (const property_name of class_properties_map.get(superclass)!) {
            class_properties_map.get(classname)!.push(property_name);
        }
    }
}

print(class_properties_map);
```
