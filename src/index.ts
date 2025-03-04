import { HttpService } from "@rbxts/services";
import { ApiDumpTypes } from "./ApiDumpTypes";
import { Zlib } from "@rbxts/zlib";
import { base64 } from "@rbxts/base64";

export * from "./ApiDumpTypes";
export * from "./ApiDumpConstants";

const version_link = "https://github.com/MaximumADHD/Roblox-Client-Tracker/blob/roblox/version.txt";
const api_dump_link =
	"https://github.com/MaximumADHD/Roblox-Client-Tracker/blob/roblox/Mini-API-Dump.json";

export function GetApiDumpVersion(): string {
	return HttpService.GetAsync(version_link);
}

const API_DUMP_SAVE_NAME = "API_DUMP";
const API_DUMP_VERSION_SAVE_NAME = "API_DUMP_VERSION";
interface IGetApiDumpOptions {
	/**@default false */
	Override?: string;
	/**@default false */
	DontSave?: boolean;
	/**@default API_DUMP*/
	SaveName?: string;
	/**@default API_DUMP_VERSION*/
	VersionSaveName?: string;
}

export function GetApiDump(options?: IGetApiDumpOptions): ApiDumpTypes.IAPIDump {
	if (options?.DontSave) {
		return HttpService.JSONDecode(HttpService.GetAsync(api_dump_link)) as ApiDumpTypes.IAPIDump;
	}

	const GetAndSaveApiDump = (version: string): ApiDumpTypes.IAPIDump => {
		const api_dump_text = HttpService.GetAsync(api_dump_link);
		const compressed_api_dump_text_buffer = base64.encode(
			buffer.fromstring(
				Zlib.Compress(api_dump_text, {
					level: 5,
				}),
			),
		);

		plugin.SetSetting(options?.VersionSaveName ?? API_DUMP_VERSION_SAVE_NAME, version);
		plugin.SetSetting(
			options?.SaveName ?? API_DUMP_SAVE_NAME,
			buffer.tostring(compressed_api_dump_text_buffer),
		);
		return HttpService.JSONDecode(api_dump_text) as ApiDumpTypes.IAPIDump;
	};

	const ExtractSavedApiDump = (): ApiDumpTypes.IAPIDump | undefined => {
		const encoded_api_dump_text = plugin.GetSetting(options?.SaveName ?? API_DUMP_SAVE_NAME) as
			| string
			| undefined;
		if (encoded_api_dump_text === undefined) return;

		try {
			const api_dump_text = Zlib.Decompress(
				buffer.tostring(base64.decode(buffer.fromstring(encoded_api_dump_text))),
			);

			return HttpService.JSONDecode(api_dump_text) as ApiDumpTypes.IAPIDump;
		} catch {}
	};

	if (options?.Override) {
		const version = HttpService.GetAsync(version_link);
		return GetAndSaveApiDump(version);
	}

	const [is_version_fetch_success, version] = pcall(HttpService.GetAsync, version_link);
	const existing_version = plugin.GetSetting(
		options?.VersionSaveName ?? API_DUMP_VERSION_SAVE_NAME,
	) as string | undefined;

	if (existing_version === undefined) {
		assert(is_version_fetch_success, "No access to the version link and no saved API Dump");
		warn("Wasn't been able to fetch new API Dump version");
		return GetAndSaveApiDump(version);
	}

	if (!is_version_fetch_success) {
		const api_dump = ExtractSavedApiDump();
		assert(api_dump !== undefined, "Failed so load saved API Dump");
		return api_dump;
	}

	if (version !== existing_version) {
		const [success, api_dump] = pcall(GetAndSaveApiDump, version);
		if (!success) {
			warn("Wasn't been able to fetch new API Dump");
			const existing_api_dump = ExtractSavedApiDump();
			assert(existing_api_dump !== undefined, "Failed so load saved API Dump");
			return existing_api_dump;
		}

		return api_dump;
	}

	const saved_api_dump = ExtractSavedApiDump();
	if (saved_api_dump === undefined) {
		warn("Failed so load saved API Dump");
		return GetAndSaveApiDump(version);
	}

	return saved_api_dump;
}
