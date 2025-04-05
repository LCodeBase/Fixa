import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Icons
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Algoritmo de repetição espaçada',
    description: 'Baseado no algoritmo SM-2 do Anki, otimiza seus estudos mostrando os flashcards no momento ideal para memorização.',
    icon: ClockIcon,
  },
  {
    name: 'Estatísticas detalhadas',
    description: 'Acompanhe seu progresso com gráficos e métricas que mostram seu desempenho ao longo do tempo.',
    icon: CheckCircleIcon,
  },
  {
    name: 'Suporte a mídia',
    description: 'Adicione imagens e áudio aos seus flashcards para um aprendizado mais completo e eficiente.',
    icon: DevicePhoneMobileIcon,
  },
  {
    name: 'Modo escuro',
    description: 'Estude com conforto em qualquer ambiente com o modo escuro integrado.',
    icon: MoonIcon,
  },
];

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Hero section */}
      <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
              <div className="lg:py-24">
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                  <span className="block">A maneira inteligente</span>
                  <span className="block text-primary-600 dark:text-primary-400">de memorizar qualquer coisa</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Fixa utiliza flashcards e repetição espaçada para otimizar seu aprendizado. Ideal para estudantes, profissionais e autodidatas que desejam memorizar informações de forma eficiente e duradoura.
                </p>
                <div className="mt-10 sm:mt-12">
                  {user ? (
                    <div className="sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <Link
                          to="/dashboard"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                        >
                          Ir para o Dashboard
                          <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <Link
                          to="/register"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                        >
                          Começar agora
                          <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link
                          to="/login"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
                        >
                          Entrar
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-12 -mb-16 sm:-mb-48 lg:m-0 lg:relative">
              <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
                <img
                  className="w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="/images/hero-illustration.svg"
                  alt="Ilustração de flashcards"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="relative bg-gray-50 dark:bg-gray-900 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
          <h2 className="text-base font-semibold tracking-wider text-primary-600 dark:text-primary-400 uppercase">Memorize com eficiência</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
            Tudo o que você precisa para aprender melhor
          </p>
          <p className="mt-5 max-w-prose mx-auto text-xl text-gray-500 dark:text-gray-400">
            Fixa combina as melhores técnicas de aprendizado em uma plataforma intuitiva e poderosa.
          </p>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow-lg">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-primary-600 dark:bg-primary-700 rounded-md shadow-lg">
                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">{feature.name}</h3>
                      <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-600 dark:bg-primary-800">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Pronto para começar?</span>
            <span className="block">Crie sua conta gratuitamente hoje.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Junte-se a milhares de estudantes que já estão melhorando sua capacidade de memorização com o Fixa.
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 sm:w-auto"
          >
            Criar conta gratuita
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;