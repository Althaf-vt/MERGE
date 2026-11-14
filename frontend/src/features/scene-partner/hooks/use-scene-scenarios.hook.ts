import { useState, useMemo } from 'react';
import { useGetScenariosQuery } from '../api/scene-partner.api';
import type { ScenarioCategory } from '../types/scene-partner.types';

export const useSceneScenarios = () => {
    const [activeCategory, setActiveCategory] = useState<ScenarioCategory | 'ALL'>('ALL');

    const queryArg = useMemo(() => {
        return activeCategory === 'ALL' ? undefined : { category: activeCategory };
    }, [activeCategory]);

    const { data, isLoading, isFetching, isError, error, refetch } = useGetScenariosQuery(queryArg);

    const scenarios = useMemo(() => data?.data ?? [], [data]);

    return {
        scenarios,
        isLoading,
        isFetching,
        isError,
        error,
        activeCategory,
        setActiveCategory,
        refetch,
    };
};

