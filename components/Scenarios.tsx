import React from 'react';
import { SCENARIOS } from '../scenarios';
import type { Scenario } from '../types';
import { LayoutTemplateIcon, MagicWandIcon } from './Icons';

interface ScenariosProps {
    onSelectScenario: (scenario: Scenario) => void;
    onStartFromScratch: () => void;
}

const ScenarioCard: React.FC<{ scenario: Scenario; onSelect: () => void }> = ({ scenario, onSelect }) => (
    <div
        onClick={onSelect}
        className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:border-indigo-500/50 group flex flex-col relative hover:shadow-2xl hover:shadow-indigo-900/40"
    >
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-indigo-500/10 blur-2xl"></div>
        <img src={scenario.imageUrl} alt={scenario.name} className="w-full h-40 object-cover" />
        <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{scenario.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{scenario.description}</p>
            </div>
            <div className="mt-3 text-sm font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Выбрать →
            </div>
        </div>
    </div>
);

const Scenarios: React.FC<ScenariosProps> = ({ onSelectScenario, onStartFromScratch }) => {
    return (
        <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <LayoutTemplateIcon className="w-8 h-8 text-indigo-400" />
                Выберите сценарий
            </h2>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto">Начните с готового шаблона для быстрого результата или создайте всё с нуля.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {SCENARIOS.map(scenario => (
                    <ScenarioCard key={scenario.id} scenario={scenario} onSelect={() => onSelectScenario(scenario)} />
                ))}
            </div>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-900/50 px-3 text-sm font-medium text-gray-400 backdrop-blur-sm">или</span>
                </div>
            </div>

            <button
                onClick={onStartFromScratch}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 mx-auto border border-gray-700"
            >
                <MagicWandIcon className="w-5 h-5" />
                Начать с нуля
            </button>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
              }
            `}</style>
        </div>
    );
};

export default Scenarios;