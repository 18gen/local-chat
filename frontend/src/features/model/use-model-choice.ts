import { fetchModels } from "@/features/model/models";
import { useFetched } from "@/hooks/use-fetched";
import { createStoredValue } from "@/lib/stored-value";

const preferredModel = createStoredValue("local-chat:model", "", (raw) => raw);

const NO_MODELS: string[] = [];

/**
 * The models on offer and the one in use: the last chosen while it's still
 * offered, else the default. Until the list arrives, or if it can't, the
 * model is null and the backend uses its default.
 */
export function useModelChoice() {
  const models = useFetched("models", (_, signal) => fetchModels(signal)).data ?? NO_MODELS;
  const preferred = preferredModel.use();

  const model = models.includes(preferred) ? preferred : (models[0] ?? null);
  return { models, model, setModel: preferredModel.set };
}
