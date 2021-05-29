import { readPackageJson, updatePackageJson } from './pkg';

export enum PkgScopeStatus {
	installed = 'installed',
	unchanged = 'unchanged',
	updated = 'updated',
}

export type PkgScopeProps = Record<string, any>;

export type PkgScopeRaw<P extends PkgScopeProps> = {
	name: string;
	version: string;
	props?: P;
}

export type PkgScope<P extends PkgScopeProps> = {
	name: string;
	version: string;
	props: P;
	status: PkgScopeStatus;
}

export type InitPkgScopeOptions<P extends PkgScopeProps> = {
	name: string,
	handler: (scope: PkgScopeRaw<P>, oldVersion?: string) => Promise<P>,
	__dirname: string;
	ROOT_DIR?: string;
}

export async function initPackageJsonScope<P extends PkgScopeProps>(options: InitPkgScopeOptions<P>) {
	const {
		name,
		handler,
		__dirname,
		ROOT_DIR, 
	} = options;

	const appPkg = readPackageJson(ROOT_DIR, {cache: false});
	const modulePkg = readPackageJson(__dirname, {cache: false});
	const moduleName = modulePkg.name as string;
	const moduleVerion = modulePkg.version as string;

	const rawScopes = appPkg[moduleName] as PkgScopeProps | undefined;
	let rawScope = rawScopes?.[name] as PkgScopeRaw<P> | undefined;
	let status = PkgScopeStatus.unchanged

	if (!rawScope || rawScope.version !== moduleVerion) {
		const oldVersion = rawScope?.version;

		status = rawScope ? PkgScopeStatus.updated : PkgScopeStatus.installed;
		rawScope = rawScope || { name, version: '' };

		rawScope.version = moduleVerion
		rawScope.props = await handler(rawScope, oldVersion);

		updatePackageJson(ROOT_DIR, {
			[moduleName]: {
				...rawScopes,
				[name]: rawScope,
			},
		});
	}

	return <PkgScope<P>>{
		...rawScope,
		status,
	};
}

export function readPackageJsonScope<P extends PkgScopeProps>(__dirname: string, name: string) {
	const appPkg = readPackageJson(undefined, {cache: false});
	const modulePkg = readPackageJson(__dirname, {cache: false});
	const moduleName = modulePkg.name as string;
	const rawScopes = appPkg[moduleName] as PkgScopeProps | undefined;

	return rawScopes?.[name] as PkgScopeRaw<P> | undefined;
}

export function removePackageJsonScope(__dirname: string, name: string) {
	const appPkg = readPackageJson(undefined, {cache: false});
	const modulePkg = readPackageJson(__dirname, {cache: false});
	const moduleName = modulePkg.name as string;
	const rawScopes = appPkg[moduleName] as PkgScopeProps | undefined;

	if (rawScopes && rawScopes[name]) {
		delete rawScopes[name]
		
		updatePackageJson(undefined, {
			[moduleName]: rawScopes,
		});
	}
}

export function removePackageJsonAllScopes(__dirname: string) {
	const appPkg = readPackageJson(undefined, {cache: false});
	const modulePkg = readPackageJson(__dirname, {cache: false});
	const moduleName = modulePkg.name as string;

	if (appPkg[moduleName]) {
		delete appPkg[moduleName]
		
		updatePackageJson(undefined, {
			...appPkg,
		});
	}
}
