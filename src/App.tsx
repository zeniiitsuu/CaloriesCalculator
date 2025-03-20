import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, QuestionMarkCircleIcon, CalculatorIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { ThemeProvider, useTheme } from './ThemeContext'

interface CalorieResult {
  bmr: number
  maintenance: number
  weightLoss: number
  extremeWeightLoss: number
  weightGain: number
  extremeWeightGain: number
  bmi: number
  macros: {
    protein: number
    carbs: number
    fats: number
  }
}

// Update the activity levels to use translation keys
const activityLevels = [
  { value: 1.2, labelKey: 'sedentary', descriptionKey: 'sedentaryDesc' },
  { value: 1.375, labelKey: 'lightExercise', descriptionKey: 'lightExerciseDesc' },
  { value: 1.465, labelKey: 'moderateExercise', descriptionKey: 'moderateExerciseDesc' },
  { value: 1.55, labelKey: 'heavyExercise', descriptionKey: 'heavyExerciseDesc' },
  { value: 1.725, labelKey: 'athlete', descriptionKey: 'athleteDesc' }
];

// Add language type and translations
type Language = 'en' | 'pt' | 'ja';

const translations = {
  en: {
    title: 'Calorie Calculator',
    subtitle: 'Calculate your daily calorie needs with precision',
    male: 'Male',
    female: 'Female',
    age: 'Age (years)',
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    activityLevel: 'Activity Level',
    calculate: 'Calculate',
    calculating: 'Calculating...',
    complete: 'complete',
    bmr: 'Base Metabolic Rate',
    maintenance: 'Maintenance Calories',
    weightLoss: 'Weight Loss',
    weightGain: 'Weight Gain',
    moderateLoss: 'Moderate Weight Loss',
    extremeLoss: 'Extreme Weight Loss',
    moderateGain: 'Moderate Weight Gain',
    extremeGain: 'Extreme Weight Gain',
    caloriesBurned: 'Calories burned at complete rest',
    dailyCalories: 'Daily calories to maintain weight',
    bmi: 'Body Mass Index (BMI)',
    macronutrients: 'Recommended Macronutrients',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats',
    sedentary: 'Sedentary (office job)',
    sedentaryDesc: 'Little or no exercise',
    lightExercise: 'Light Exercise',
    lightExerciseDesc: '1-3 times/week',
    moderateExercise: 'Moderate Exercise',
    moderateExerciseDesc: '3-5 times/week',
    heavyExercise: 'Heavy Exercise',
    heavyExerciseDesc: '6-7 times/week',
    athlete: 'Athlete',
    athleteDesc: '2x training per day',
    developedBy: 'Project developed by',
  },
  pt: {
    title: 'Calculadora de Calorias',
    subtitle: 'Calcule suas necessidades diárias de calorias com precisão',
    male: 'Masculino',
    female: 'Feminino',
    age: 'Idade (anos)',
    weight: 'Peso (kg)',
    height: 'Altura (cm)',
    activityLevel: 'Nível de Atividade',
    calculate: 'Calcular',
    calculating: 'Calculando...',
    complete: 'completo',
    bmr: 'Taxa Metabólica Basal',
    maintenance: 'Calorias de Manutenção',
    weightLoss: 'Perda de Peso',
    weightGain: 'Ganho de Peso',
    moderateLoss: 'Perda de Peso Moderada',
    extremeLoss: 'Perda de Peso Extrema',
    moderateGain: 'Ganho de Peso Moderado',
    extremeGain: 'Ganho de Peso Extremo',
    caloriesBurned: 'Calorias queimadas em repouso completo',
    dailyCalories: 'Calorias diárias para manter o peso',
    bmi: 'Índice de Massa Corporal (IMC)',
    macronutrients: 'Macronutrientes Recomendados',
    protein: 'Proteína',
    carbs: 'Carboidratos',
    fats: 'Gorduras',
    sedentary: 'Sedentário (trabalho de escritório)',
    sedentaryDesc: 'Pouco ou nenhum exercício',
    lightExercise: 'Exercício Leve',
    lightExerciseDesc: '1-3 vezes/semana',
    moderateExercise: 'Exercício Moderado',
    moderateExerciseDesc: '3-5 vezes/semana',
    heavyExercise: 'Exercício Intenso',
    heavyExerciseDesc: '6-7 vezes/semana',
    athlete: 'Atleta',
    athleteDesc: '2x treino por dia',
    developedBy: 'Projeto desenvolvido por',
  },
  ja: {
    title: 'カロリー計算機',
    subtitle: '1日のカロリー必要量を正確に計算',
    male: '男性',
    female: '女性',
    age: '年齢（歳）',
    weight: '体重（kg）',
    height: '身長（cm）',
    activityLevel: '活動レベル',
    calculate: '計算する',
    calculating: '計算中...',
    complete: '完了',
    bmr: '基礎代謝率',
    maintenance: '維持カロリー',
    weightLoss: '減量',
    weightGain: '増量',
    moderateLoss: '適度な減量',
    extremeLoss: '急激な減量',
    moderateGain: '適度な増量',
    extremeGain: '急激な増量',
    caloriesBurned: '完全休息時の消費カロリー',
    dailyCalories: '体重維持に必要な1日のカロリー',
    bmi: '体格指数（BMI）',
    macronutrients: '推奨栄養素',
    protein: 'タンパク質',
    carbs: '炭水化物',
    fats: '脂質',
    sedentary: '座りがち（デスクワーク）',
    sedentaryDesc: 'ほとんど運動なし',
    lightExercise: '軽い運動',
    lightExerciseDesc: '週1-3回',
    moderateExercise: '適度な運動',
    moderateExerciseDesc: '週3-5回',
    heavyExercise: '激しい運動',
    heavyExerciseDesc: '週6-7回',
    athlete: 'アスリート',
    athleteDesc: '1日2回のトレーニング',
    developedBy: '開発者：',
  }
};

// First, let's create a custom dropdown component
const ActivityLevelDropdown = ({ 
  value, 
  onChange, 
  language 
}: { 
  value: number;
  onChange: (value: number) => void;
  language: 'en' | 'pt' | 'ja';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input-field flex items-center justify-between group"
      >
        <span>
          {translations[language][
            activityLevels.find(level => level.value === value)?.labelKey || 'moderateExercise'
          ]}
        </span>
        <ChevronDownIcon 
          className={`w-5 h-5 text-accent transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full bottom-[calc(100%_-_1px)] overflow-hidden rounded-xl bg-secondary/80 backdrop-blur-lg border border-white/10 shadow-xl"
          >
            {activityLevels.map((level) => (
              <motion.button
                key={level.value}
                onClick={() => {
                  onChange(level.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-accent/20 transition-all
                  ${value === level.value ? 'bg-accent/30 text-white' : 'text-gray-300'}
                  flex flex-col gap-1 first:rounded-t-xl last:rounded-b-xl`}
                whileHover={{ x: 4 }}
              >
                <span className="font-medium">
                  {translations[language][level.labelKey]}
                </span>
                <span className="text-sm text-gray-400">
                  {translations[language][level.descriptionKey]}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  const [age, setAge] = useState<string>('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [weight, setWeight] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [activityLevel, setActivityLevel] = useState<number>(1.465)
  const [result, setResult] = useState<CalorieResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [previousResult, setPreviousResult] = useState<CalorieResult | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const { isDark, toggleTheme } = useTheme()

  // Add a ref for the results section
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate form completion progress
    let progress = 0
    if (age) progress += 25
    if (weight) progress += 25
    if (height) progress += 25
    if (gender) progress += 25
    setFormProgress(progress)
  }, [age, weight, height, gender])

  useEffect(() => {
    // This effect will run whenever result or showResults changes
    if (result && showResults && !isCalculating) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [result, showResults, isCalculating]);

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100
    return weight / (heightInMeters * heightInMeters)
  }

  const calculateMacros = (calories: number) => {
    // 30% protein, 40% carbs, 30% fats
    return {
      protein: Math.round((calories * 0.3) / 4), // 4 calories per gram of protein
      carbs: Math.round((calories * 0.4) / 4),   // 4 calories per gram of carbs
      fats: Math.round((calories * 0.3) / 9)     // 9 calories per gram of fat
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal weight'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }

  const calculateCalories = () => {
    const weightNum = parseFloat(weight)
    const heightNum = parseFloat(height)
    const ageNum = parseInt(age)

    if (!weightNum || !heightNum || !ageNum || !gender) return

    setIsCalculating(true)
    setPreviousResult(result)

    // Calculate immediately but store in a variable
    const bmr = gender === 'male'
      ? (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5
      : (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161

    const maintenance = Math.round(bmr * activityLevel)
    const bmi = calculateBMI(weightNum, heightNum)
    const macros = calculateMacros(maintenance)
    
    const newResult = {
      bmr: Math.round(bmr),
      maintenance,
      weightLoss: maintenance - 500,
      extremeWeightLoss: maintenance - 1000,
      weightGain: maintenance + 500,
      extremeWeightGain: maintenance + 1000,
      bmi,
      macros
    }

    // Show animation and then update result
    setTimeout(() => {
      setResult(newResult)
      setShowResults(true)
      setIsCalculating(false)
    }, 600)
  }

  // Add a function to check if form is complete
  const isFormComplete = () => {
    return Boolean(
      age && 
      weight && 
      height && 
      gender && 
      !isCalculating
    )
  }

  return (
    <div className={isDark ? 'dark' : 'light'}>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 sm:p-8 relative"
          >
            {/* Theme Toggle Button - Moved inside the panel */}
            <button 
              onClick={toggleTheme}
              className="absolute top-4 right-4 p-2 rounded-full transition-all duration-300 
                hover:scale-110 hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <SunIcon className="w-6 h-6 text-accent" />
              ) : (
                <MoonIcon className="w-6 h-6" style={{ color: '#ff9ed2' }} />
              )}
            </button>

            <motion.h1 
              className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {translations[language].title}
            </motion.h1>
            
            {/* Language Selection */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  language === 'en' 
                    ? (isDark ? 'bg-accent text-white' : 'bg-[#ff9ed2] text-white')
                    : 'bg-secondary/30 text-gray-300 hover:bg-secondary/50'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  language === 'pt' 
                    ? (isDark ? 'bg-accent text-white' : 'bg-[#ff9ed2] text-white')
                    : 'bg-secondary/30 text-gray-300 hover:bg-secondary/50'
                }`}
              >
                Português
              </button>
              <button
                onClick={() => setLanguage('ja')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  language === 'ja' 
                    ? (isDark ? 'bg-accent text-white' : 'bg-[#ff9ed2] text-white')
                    : 'bg-secondary/30 text-gray-300 hover:bg-secondary/50'
                }`}
              >
                日本語
              </button>
            </div>

            <motion.p 
              className="text-gray-400 text-center mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {translations[language].subtitle}
            </motion.p>

            <motion.p 
              className="text-sm text-center mb-8 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-gray-400">
                {translations[language].developedBy}
              </span>
              <a
                href="https://github.com/zeniiitsuu"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors duration-300 
                  flex items-center gap-1 group"
                style={{ color: isDark ? '#6366f1' : '#ff9ed2' }}
              >
                Zeni
                <svg
                  viewBox="0 0 16 16"
                  className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300 
                    group-hover:translate-x-0.5 transform"
                  fill="currentColor"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </a>
            </motion.p>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="progress-bar">
                <motion.div 
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${formProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2 text-center">{formProgress}% complete</p>
            </div>

            <div className="space-y-6">
              {/* Gender Selection */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${
                    gender === 'male'
                      ? (isDark ? 'bg-accent text-white' : 'bg-[#4cb4f0] text-white')
                      : 'bg-secondary/30 text-gray-300'
                  } p-4 rounded-xl transition-all duration-300 hover:bg-accent/80`}
                  onClick={() => setGender('male')}
                >
                  {translations[language].male}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${
                    gender === 'female'
                      ? (isDark ? 'bg-accent text-white' : 'bg-[#4cb4f0] text-white')
                      : 'bg-secondary/30 text-gray-300'
                  } p-4 rounded-xl transition-all duration-300 hover:bg-accent/80`}
                  onClick={() => setGender('female')}
                >
                  {translations[language].female}
                </motion.button>
              </div>

              {/* Age, Weight, Height Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium mb-2">{translations[language].age}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2">{translations[language].weight}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2">{translations[language].height}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                  />
                </motion.div>
              </div>

              {/* Activity Level Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {translations[language].activityLevel}
                </label>
                <ActivityLevelDropdown
                  value={activityLevel}
                  onChange={setActivityLevel}
                  language={language}
                />
              </div>

              {/* Calculate Button */}
              <motion.button
                className={`btn-primary w-full relative ${!isFormComplete() ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={calculateCalories}
                whileHover={isFormComplete() ? { scale: 1.02 } : {}}
                whileTap={isFormComplete() ? { scale: 0.98 } : {}}
                disabled={!isFormComplete()}
                style={{ background: isDark ? 'linear-gradient(to right, #6366f1, #818cf8)' : 'linear-gradient(to right, #4cb4f0, #b0daec)' }}
              >
                {isCalculating ? (
                  <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CalculatorIcon className="w-5 h-5 mr-2 animate-spin" />
                    {translations[language].calculating}
                  </motion.div>
                ) : (
                  translations[language].calculate
                )}
              </motion.button>
            </div>

            {/* Results */}
            <AnimatePresence>
              {result && showResults && (
                <motion.div
                  ref={resultsRef}
                  className="mt-8 space-y-6 results-section"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatePresence mode="wait">
                    {isCalculating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                      >
                        <motion.div
                          className="text-accent font-medium"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          {translations[language].calculating}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  
                  {/* BMI Section */}
                  <motion.div 
                    className="glass-panel p-4"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-medium mb-4">{translations[language].bmi}</h3>
                    <div className="bmi-gauge mb-3">
                      <div 
                        className="bmi-marker"
                        style={{ left: `${(result.bmi / 40) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Underweight</span>
                      <span>Normal</span>
                      <span>Overweight</span>
                      <span>Obese</span>
                    </div>
                    <motion.p 
                      className="text-2xl font-bold text-accent"
                      animate={{ 
                        scale: previousResult?.bmi !== result.bmi ? [1, 1.1, 1] : 1,
                        color: previousResult?.bmi !== result.bmi ? 
                          (isDark ? ['#6366f1', '#818cf8', '#6366f1'] : ['#4cb4f0', '#b0daec', '#4cb4f0']) 
                          : (isDark ? '#6366f1' : '#4cb4f0')
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {result.bmi.toFixed(1)} - {getBMICategory(result.bmi)}
                    </motion.p>
                  </motion.div>

                  {/* Main Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div 
                      className="metric-card"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-lg font-medium mb-2">{translations[language].bmr}</h3>
                      <motion.p 
                        className="text-2xl font-bold text-accent"
                        animate={{ 
                          scale: previousResult?.bmr !== result.bmr ? [1, 1.1, 1] : 1,
                          color: previousResult?.bmr !== result.bmr ? 
                            (isDark ? ['#6366f1', '#818cf8', '#6366f1'] : ['#4cb4f0', '#b0daec', '#4cb4f0']) 
                            : (isDark ? '#6366f1' : '#4cb4f0')
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {result.bmr} calories
                      </motion.p>
                      <p className="text-sm text-gray-400">{translations[language].caloriesBurned}</p>
                    </motion.div>
                    
                    <motion.div 
                      className="metric-card"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-medium mb-2">{translations[language].maintenance}</h3>
                      <motion.p 
                        className="text-2xl font-bold text-accent"
                        animate={{ 
                          scale: previousResult?.maintenance !== result.maintenance ? [1, 1.1, 1] : 1,
                          color: previousResult?.maintenance !== result.maintenance ? 
                            (isDark ? ['#6366f1', '#818cf8', '#6366f1'] : ['#4cb4f0', '#b0daec', '#4cb4f0']) 
                            : (isDark ? '#6366f1' : '#4cb4f0')
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {result.maintenance} calories
                      </motion.p>
                      <p className="text-sm text-gray-400">{translations[language].dailyCalories}</p>
                    </motion.div>
                  </div>

                  {/* Macronutrients */}
                  <motion.div 
                    className="glass-panel p-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-medium mb-4">{translations[language].macronutrients}</h3>
                    <div className="flex flex-wrap gap-3">
                      <div className="group relative">
                        <div className="macro-pill protein">
                          {translations[language].protein}: {result.macros.protein}g
                        </div>
                        <div className="tooltip">
                          {Math.round(result.macros.protein * 4)} calories from protein
                        </div>
                      </div>
                      <div className="group relative">
                        <div className="macro-pill carbs">
                          {translations[language].carbs}: {result.macros.carbs}g
                        </div>
                        <div className="tooltip">
                          {Math.round(result.macros.carbs * 4)} calories from carbs
                        </div>
                      </div>
                      <div className="group relative">
                        <div className="macro-pill fats">
                          {translations[language].fats}: {result.macros.fats}g
                        </div>
                        <div className="tooltip">
                          {Math.round(result.macros.fats * 9)} calories from fats
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Weight Goals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="text-lg font-medium mb-4">{translations[language].weightLoss}</h3>
                      <div className="space-y-3">
                        <div className="metric-card">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{translations[language].moderateLoss}</p>
                              <motion.p 
                                className="text-xl font-bold text-accent-light"
                                animate={{ 
                                  scale: previousResult?.weightLoss !== result.weightLoss ? [1, 1.1, 1] : 1,
                                  color: previousResult?.weightLoss !== result.weightLoss ? 
                                    (isDark ? ['#6366f1', '#818cf8', '#6366f1'] : ['#4cb4f0', '#b0daec', '#4cb4f0']) 
                                    : (isDark ? '#6366f1' : '#4cb4f0')
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                {result.weightLoss} calories
                              </motion.p>
                            </div>
                            <div className="group relative">
                              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
                              <div className="tooltip">-0.5 kg per week</div>
                            </div>
                          </div>
                        </div>
                        <div className="metric-card">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{translations[language].extremeLoss}</p>
                              <motion.p 
                                className="text-xl font-bold text-accent-light"
                                animate={{ 
                                  scale: previousResult?.extremeWeightLoss !== result.extremeWeightLoss ? [1, 1.1, 1] : 1,
                                  color: previousResult?.extremeWeightLoss !== result.extremeWeightLoss ? 
                                    (isDark ? ['#6366f1', '#818cf8', '#6366f1'] : ['#4cb4f0', '#b0daec', '#4cb4f0']) 
                                    : (isDark ? '#6366f1' : '#4cb4f0')
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                {result.extremeWeightLoss} calories
                              </motion.p>
                            </div>
                            <div className="group relative">
                              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
                              <div className="tooltip">-1 kg per week</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="text-lg font-medium mb-4">{translations[language].weightGain}</h3>
                      <div className="space-y-3">
                        <div className="metric-card">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{translations[language].moderateGain}</p>
                              <motion.p 
                                className="text-xl font-bold text-accent-light"
                                animate={{ 
                                  scale: previousResult?.weightGain !== result.weightGain ? [1, 1.1, 1] : 1,
                                  color: previousResult?.weightGain !== result.weightGain ? 
                                    (isDark ? ['#6366f1', '#818cf8', '#6366f1'] : ['#4cb4f0', '#b0daec', '#4cb4f0']) 
                                    : (isDark ? '#6366f1' : '#4cb4f0')
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                {result.weightGain} calories
                              </motion.p>
                            </div>
                            <div className="group relative">
                              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
                              <div className="tooltip">+0.5 kg per week</div>
                            </div>
                          </div>
                        </div>
                        <div className="metric-card">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{translations[language].extremeGain}</p>
                              <motion.p 
                                className="text-xl font-bold text-accent-light"
                                animate={{ 
                                  scale: previousResult?.extremeWeightGain !== result.extremeWeightGain ? [1, 1.1, 1] : 1,
                                  color: previousResult?.extremeWeightGain !== result.extremeWeightGain ? 
                                    (isDark ? ['#6366f1', '#818cf8', '#6366f1'] : ['#4cb4f0', '#b0daec', '#4cb4f0']) 
                                    : (isDark ? '#6366f1' : '#4cb4f0')
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                {result.extremeWeightGain} calories
                              </motion.p>
                            </div>
                            <div className="group relative">
                              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
                              <div className="tooltip">+1 kg per week</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App 