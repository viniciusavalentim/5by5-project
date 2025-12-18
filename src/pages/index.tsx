import { Plus, StarHalf, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { generateFiles } from "./strategy/components/strategy-generate";

type Property = {
    name: string
    type: string
    default?: string
}

type Entity = {
    name: string
    properties: Property[]
}

type Strategy = {
    property_ref: string
    logic_type: string
}

type Context = {
    context_name: string
    target_entity: string
    strategies: Strategy[]
}

type Config = {
    global_settings: {
        root_namespace_domain: string
        root_namespace_api: string
        source_root_path: string
        paths: {
            entities: string
            interfaces: string
            implementations: string
            ioc: string
        }
    }
    entities: Entity[]
    contexts: Context[]
}


export function Home() {
    const [config, setConfig] = useState<Config>({
        global_settings: {
            root_namespace_domain: "Domain",
            root_namespace_api: "Api",
            source_root_path: "",
            paths: {
                entities: "Domain/Entities/v1",
                interfaces: "Domain/Interfaces/v1/DomainServices/Strategies",
                implementations: "Domain/DomainServices/v1/Strategies",
                ioc: "Api/Infrastructure/IoC/DependencyInjectors",
            },
        },
        entities: [],
        contexts: [],
    })

    const logicTypes = ["DateTime", "StringRegex", "GenericEquality"] //, "NumericRange", "BooleanMatch"

    const addEntity = () => {
        setConfig({
            ...config,
            entities: [...config.entities, { name: "", properties: [] }],
        })
    }

    const removeEntity = (index: number) => {
        setConfig({
            ...config,
            entities: config.entities.filter((_, i) => i !== index),
        })
    }

    const updateEntity = (index: number, field: keyof Entity, value: any) => {
        const newEntities = [...config.entities]
        newEntities[index] = { ...newEntities[index], [field]: value }
        setConfig({ ...config, entities: newEntities })
    }

    const addProperty = (entityIndex: number) => {
        const newEntities = [...config.entities]
        newEntities[entityIndex].properties.push({ name: "", type: "string" })
        setConfig({ ...config, entities: newEntities })
    }

    const removeProperty = (entityIndex: number, propIndex: number) => {
        const newEntities = [...config.entities]
        newEntities[entityIndex].properties = newEntities[entityIndex].properties.filter((_, i) => i !== propIndex)
        setConfig({ ...config, entities: newEntities })
    }

    const updateProperty = (entityIndex: number, propIndex: number, field: keyof Property, value: string) => {
        const newEntities = [...config.entities]
        newEntities[entityIndex].properties[propIndex] = {
            ...newEntities[entityIndex].properties[propIndex],
            [field]: value,
        }
        setConfig({ ...config, entities: newEntities })
    }

    const addContext = () => {
        setConfig({
            ...config,
            contexts: [...config.contexts, { context_name: "", target_entity: "", strategies: [] }],
        })
    }

    const removeContext = (index: number) => {
        setConfig({
            ...config,
            contexts: config.contexts.filter((_, i) => i !== index),
        })
    }

    const updateContext = (index: number, field: keyof Context, value: any) => {
        const newContexts = [...config.contexts]
        newContexts[index] = { ...newContexts[index], [field]: value }
        setConfig({ ...config, contexts: newContexts })
    }

    const addStrategy = (contextIndex: number) => {
        const newContexts = [...config.contexts]
        newContexts[contextIndex].strategies.push({ property_ref: "", logic_type: "GenericEquality" })
        setConfig({ ...config, contexts: newContexts })
    }

    const removeStrategy = (contextIndex: number, strategyIndex: number) => {
        const newContexts = [...config.contexts]
        newContexts[contextIndex].strategies = newContexts[contextIndex].strategies.filter((_, i) => i !== strategyIndex)
        setConfig({ ...config, contexts: newContexts })
    }

    const updateStrategy = (contextIndex: number, strategyIndex: number, field: keyof Strategy, value: string) => {
        const newContexts = [...config.contexts]
        newContexts[contextIndex].strategies[strategyIndex] = {
            ...newContexts[contextIndex].strategies[strategyIndex],
            [field]: value,
        }
        setConfig({ ...config, contexts: newContexts })
    }

    const downloadConfig = () => {
        const dataStr = JSON.stringify(config, null, 2)
        // const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
        // const exportFileDefaultName = "strategy-config.json"
        generateFiles(dataStr)
        // const linkElement = document.createElement("a")
        // linkElement.setAttribute("href", dataUri)
        // linkElement.setAttribute("download", exportFileDefaultName)
        // linkElement.click()
    }

    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-balance text-3xl font-bold tracking-tight">Strategy Configurator</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Configure seu gerador de estratégias</p>
                        </div>
                        <Button
                            size="lg"
                            onClick={downloadConfig}
                            className=" text-white cursor-pointer gap-2 relative overflow-hidden rounded-xl bg-linear-to-r from-[#0d0617] to-[#1a0d2e] border border-purple-900/20 shadow-xl group"
                        >
                            <StarHalf className="h-4 w-4" />
                            Gerar
                        </Button>
                    </div>

                    {/* Global Settings */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Configurações Globais</CardTitle>
                            <CardDescription>Configure quais os namespaces que precisam ser importados</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Root Namespace Domain</label>
                                    <Input
                                        value={config.global_settings.root_namespace_domain}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                global_settings: { ...config.global_settings, root_namespace_domain: e.target.value },
                                            })
                                        }
                                        className="bg-muted/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Root Namespace API</label>
                                    <Input
                                        value={config.global_settings.root_namespace_api}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                global_settings: { ...config.global_settings, root_namespace_api: e.target.value },
                                            })
                                        }
                                        className="bg-muted/50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Paths */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Paths</CardTitle>
                            <CardDescription>Configure quais caminhos vão ficar os arquivos do contexto</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted-foreground">Entities</label>
                                    <Input
                                        value={config.global_settings.paths.entities}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                global_settings: {
                                                    ...config.global_settings,
                                                    paths: { ...config.global_settings.paths, entities: e.target.value },
                                                },
                                            })
                                        }
                                        className="h-9 bg-muted/50 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted-foreground">Interfaces</label>
                                    <Input
                                        value={config.global_settings.paths.interfaces}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                global_settings: {
                                                    ...config.global_settings,
                                                    paths: { ...config.global_settings.paths, interfaces: e.target.value },
                                                },
                                            })
                                        }
                                        className="h-9 bg-muted/50 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted-foreground">Implementations</label>
                                    <Input
                                        value={config.global_settings.paths.implementations}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                global_settings: {
                                                    ...config.global_settings,
                                                    paths: { ...config.global_settings.paths, implementations: e.target.value },
                                                },
                                            })
                                        }
                                        className="h-9 bg-muted/50 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted-foreground">IoC</label>
                                    <Input
                                        value={config.global_settings.paths.ioc}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                global_settings: {
                                                    ...config.global_settings,
                                                    paths: { ...config.global_settings.paths, ioc: e.target.value },
                                                },
                                            })
                                        }
                                        className="h-9 bg-muted/50 text-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    {/* Entities */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Entidades</CardTitle>
                                <Button onClick={addEntity} size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Adicionar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {config.entities.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-8">Nenhuma entidade configurada</p>
                            )}
                            {config.entities.map((entity, entityIndex) => (
                                <div key={entityIndex} className="space-y-3 rounded-lg border border-border/50 p-4">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-sm font-medium">Nome da Entidade</label>
                                            <Input
                                                value={entity.name}
                                                onChange={(e) => updateEntity(entityIndex, "name", e.target.value)}
                                                placeholder="Ex: SatTrainingRecordEntity"
                                                className="bg-muted/50"
                                            />
                                        </div>
                                        <Button
                                            onClick={() => removeEntity(entityIndex)}
                                            variant="ghost"
                                            size="icon"
                                            className="mt-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Propriedades</label>
                                            <Button
                                                onClick={() => addProperty(entityIndex)}
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                            >
                                                <Plus className="mr-1 h-3 w-3" />
                                                Propriedade
                                            </Button>
                                        </div>
                                        {entity.properties.map((prop, propIndex) => (
                                            <div key={propIndex} className="flex gap-2">
                                                <Input
                                                    value={prop.name}
                                                    onChange={(e) => updateProperty(entityIndex, propIndex, "name", e.target.value)}
                                                    placeholder="Nome"
                                                    className="bg-muted/50"
                                                />
                                                <Input
                                                    value={prop.type}
                                                    onChange={(e) => updateProperty(entityIndex, propIndex, "type", e.target.value)}
                                                    placeholder="Tipo"
                                                    className="bg-muted/50"
                                                />
                                                <Input
                                                    value={prop.default || ""}
                                                    onChange={(e) => updateProperty(entityIndex, propIndex, "default", e.target.value)}
                                                    placeholder="Default (opcional)"
                                                    className="bg-muted/50"
                                                />
                                                <Button
                                                    onClick={() => removeProperty(entityIndex, propIndex)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Contexts */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Strategies</CardTitle>
                                <Button onClick={addContext} size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Adicionar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {config.contexts.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-8">Nenhum contexto configurado</p>
                            )}
                            {config.contexts.map((context, contextIndex) => (
                                <div key={contextIndex} className="space-y-3 rounded-lg border border-border/50 p-4">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 grid gap-3 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Nome do Contexto</label>
                                                <Input
                                                    value={context.context_name}
                                                    onChange={(e) => updateContext(contextIndex, "context_name", e.target.value)}
                                                    placeholder="Ex: Filter"
                                                    className="bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Entidade Alvo</label>
                                                <Input
                                                    value={context.target_entity}
                                                    onChange={(e) => updateContext(contextIndex, "target_entity", e.target.value)}
                                                    placeholder="Ex: SatTrainingRecordEntity"
                                                    className="bg-muted/50"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => removeContext(contextIndex)}
                                            variant="ghost"
                                            size="icon"
                                            className="mt-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Estratégias</label>
                                            <Button
                                                onClick={() => addStrategy(contextIndex)}
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                            >
                                                <Plus className="mr-1 h-3 w-3" />
                                                Estratégia
                                            </Button>
                                        </div>
                                        {context.strategies.map((strategy, strategyIndex) => (
                                            <div key={strategyIndex} className="flex gap-2">
                                                <Input
                                                    value={strategy.property_ref}
                                                    onChange={(e) => updateStrategy(contextIndex, strategyIndex, "property_ref", e.target.value)}
                                                    placeholder="Referência da Propriedade"
                                                    className="flex-1 bg-muted/50"
                                                />
                                                <Select
                                                    value={strategy.logic_type}
                                                    onValueChange={(value) =>
                                                        updateStrategy(contextIndex, strategyIndex, "logic_type", value)
                                                    }
                                                >
                                                    <SelectTrigger className="bg-muted/50">
                                                        <SelectValue placeholder="Selecione o tipo de lógica" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {logicTypes.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    onClick={() => removeStrategy(contextIndex, strategyIndex)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}