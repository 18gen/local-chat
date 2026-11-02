import { useEffect, useState } from "react";

import { fetchModels } from "@/features/model/models";
import { createStoredValue } from "@/lib/stored-value";

const preferredModel = createStoredValue("local-chat:model", "", (raw) => raw);

/**
 * The models on offer and the one in use: the last chosen while it's still
 * offered, else the default. Until the list arrives, or if it can't, the
 * model is null and the backend uses its default.
 */
export function useModelChoice() {
  const [models, setModels] = useState<string[]>([]);
  const preferred = preferredModel.use();

  useEffect(() => {
    const controller = new AbortController();
    fetchModels(controller.signal).then(setModels, () => {
      // No list, so no choice; replies still come from the default model.
    });
    return () => controller.abort();
  }, []);

  const model = models.includes(preferred) ? preferred : (models[0] ?? null);
  return { models, model, setModel: preferredModel.set };
}
