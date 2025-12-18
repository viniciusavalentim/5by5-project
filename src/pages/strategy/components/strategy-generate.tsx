import { toast } from 'sonner';

interface Property {
    name: string;
    type: string;
    default?: string;
}

interface Entity {
    name: string;
    properties: Property[];
}

interface Strategy {
    property_ref: string;
    logic_type: 'DateTime' | 'StringRegex' | 'GenericEquality';
}

interface Context {
    context_name: string;
    target_entity: string;
    strategies: Strategy[];
}

interface ProjectSchema {
    global_settings: {
        root_namespace_domain: string;
        root_namespace_api: string;
        paths: {
            entities: string;
            interfaces: string;
            implementations: string;
            ioc: string;
        };
    };
    entities?: Entity[];
    contexts?: Context[];
}

declare global {
    interface Window {
        showDirectoryPicker: (options?: any) => Promise<FileSystemDirectoryHandle>;
    }
}

const STRATEGY_LOGIC_MAP: Record<string, (prop: string, entity: string) => string> = {
    "DateTime": (prop, entity) => 
        `if (criteria.${prop}.HasValue)
         {
            Expression<Func<${entity}, bool>> filterExpression = p =>
                p.${prop}.HasValue &&
                p.${prop}.Value.Year == criteria.${prop}.Value.Year &&
                p.${prop}.Value.Month == criteria.${prop}.Value.Month &&
                p.${prop}.Value.Day == criteria.${prop}.Value.Day;

            return Builders<${entity}>.Filter.Where(filterExpression);
         }
         return null;`,

    "StringRegex": (prop, entity) => 
       `if (null != criteria.${prop})
        {
            var builder = Builders<${entity}>.Filter;
            return builder.Regex(p => p.${prop}, new BsonRegularExpression(criteria.${prop}, "i"));
        }
        return null;`,

    "GenericEquality": (prop, entity) => `if (criteria.${prop} != null) 
            {
                return Builders<${entity}>.Filter.Eq(p => p.${prop}, criteria.${prop});
            }
            return null;`
};

const writeFile = async (
    rootHandle: FileSystemDirectoryHandle,
    relativePath: string,
    fileName: string,
    content: string
): Promise<void> => {
    const parts = relativePath.split(/[\\/]/).filter(p => p !== "");
    let currentHandle = rootHandle;

    for (const part of parts) {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
    }

    const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
};

export const generateFiles = async (jsonInput: string): Promise<void> => {
    try {
        if (!jsonInput.trim()) throw new Error("O JSON de entrada está vazio.");

        const data: ProjectSchema = JSON.parse(jsonInput);
        const { global_settings: settings, entities, contexts } = data;

        const rootHandle = await window.showDirectoryPicker();
        toast.message("Processando estruturas...");

        if (entities) {
            for (const ent of entities) {
                const propsCode = ent.properties.map(p => `
    [BsonElement("${p.name}")]
    public ${p.type} ${p.name} { get; set; }${p.default || ""}`).join("");

                const content = `using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ${settings.root_namespace_domain}.Entities.v1;

public class ${ent.name}
{${propsCode}
}`;
                await writeFile(rootHandle, settings.paths.entities, `${ent.name}.cs`, content);
            }
        }

        const injectorData: Array<{ context: string; classes: string[] }> = [];

        if (contexts) {
            for (const ctx of contexts) {
                const interfaceName = `I${ctx.context_name}Strategy`;

                const interfaceContent = `using MongoDB.Driver;
using ${settings.root_namespace_domain}.Entities.v1;

namespace ${settings.root_namespace_domain}.Interfaces.v1.Strategies;

public interface ${interfaceName}
{
    FilterDefinition<${ctx.target_entity}>? CreateFilter(${ctx.target_entity} filter);
}`;
                await writeFile(rootHandle, settings.paths.interfaces, `${interfaceName}.cs`, interfaceContent);

                const createdClasses: string[] = [];
                for (const strat of ctx.strategies) {
                    const className = `${strat.property_ref}${ctx.context_name}Strategy`;
                    const logicFn = STRATEGY_LOGIC_MAP[strat.logic_type];

                    if (logicFn) {
                        const implContent = `using System;
using MongoDB.Driver;
using ${settings.root_namespace_domain}.Entities.v1;
using ${settings.root_namespace_domain}.Interfaces.v1.Strategies;

namespace ${settings.root_namespace_domain}.Services.v1.Strategies.${ctx.context_name}Strategies;

public class ${className} : ${interfaceName}
{
    public FilterDefinition<${ctx.target_entity}>? CreateFilter(${ctx.target_entity} criteria)
    {
        ${logicFn(strat.property_ref, ctx.target_entity)}
    }
}`;
                        await writeFile(rootHandle, `${settings.paths.implementations}/${ctx.context_name}Strategies`, `${className}.cs`, implContent);
                        createdClasses.push(className);
                    }
                }
                injectorData.push({ context: ctx.context_name, classes: createdClasses });
            }
        }

        // 3. Dependency Injection (IoC)
        if (injectorData.length > 0) {
            const usings = injectorData.map(i => `using ${settings.root_namespace_domain}.Services.v1.Strategies.${i.context}Strategies;`).join("\n");
            const registrations = injectorData.map(i => `        container.Collection.Register<I${i.context}Strategy>(
            ${i.classes.map(c => `typeof(${c})`).join(",\n            ")}
        );`).join("\n");

            const iocContent = `using SimpleInjector;
${usings}

namespace ${settings.root_namespace_api}.Infrastructure.IoC;

public static class DomainServiceInjector
{
    public static void InjectStrategyDependencies(this Container container)
    {
${registrations}
    }
}`;
            await writeFile(rootHandle, settings.paths.ioc, `DomainServiceInjector.cs`, iocContent);
        }

        toast.success("Arquivos C# gerados com sucesso no seu disco!");
    } catch (err: any) {
        console.error(err);
        toast.error(`Erro: ${err.message}`);
    }
};