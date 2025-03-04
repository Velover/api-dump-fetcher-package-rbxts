export namespace ApiDumpTypes {
	export interface IEnum {
		Name: string;
		Tags?: Array<string>;
		Items: Array<{
			Name: string;
			Value: number;
			LegacyNames?: Array<string>;
			Tags?: Array<string>;
		}>;
	}

	interface ITag {
		PreferredDescriptorName: string;
		ThreadSafety: string;
	}
	interface IReturnType {
		Category: string;
		Name: string;
	}
	export interface IMember {
		Category?: string;
		Default?: string;
		MemberType: string;
		Name: string;
		Security:
			| string
			| {
					Read: string;
					Write: string;
			  };
		Serialization?: {
			CanLoad: boolean;
			CanSave: boolean;
		};
		Tags?: Array<string | ITag>;
		ThreadSafety: string;
		ValueType?: {
			Category: string;
			Name: string;
		};
		Parameters?: Array<{
			Name: string;
			Type: {
				Category: string;
				Name: string;
			};
			Default?: string;
		}>;
		ReturnType?: IReturnType | Array<IReturnType>;
		Capabilities?:
			| Array<string>
			| {
					Read?: string;
					Write?: string;
			  };
	}

	export interface IClass {
		MemoryCategory: string;
		Name: string;
		Superclass: string;
		Tags?: Array<string | ITag>;
		Members: Array<IMember>;
	}

	export interface IAPIDump {
		Classes: Array<IClass>;
		Enums: Array<IEnum>;
		Version: number;
	}
}
