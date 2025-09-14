import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
    ArrowRight,
    Briefcase,
    Building2,
    CheckCircle,
    Globe,
    Search,
    Star,
    TrendingUp,
    Users,
    Zap
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/AuthContext";
import companies from "../data/companies.json";
import faqs from "../data/faq.json";

const LandingPage = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  // Redirect signed-in users to their appropriate dashboard
  useEffect(() => {
    if (isLoaded && user) {
      if (user.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else if (user.role === 'candidate') {
        navigate('/jobs');
      }
    }
  }, [user, isLoaded, navigate]);
  const handleGetStarted = () => {
    navigate('/?sign-in=true');
  };

  return (
    <main className="flex flex-col gap-12 sm:gap-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 rounded-3xl blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">India's #1 Job Portal</span>
          </div>
          
          <h1 className="flex flex-col items-center justify-center gradient-title font-extrabold text-4xl sm:text-6xl lg:text-8xl tracking-tighter py-4">
            Find Your Dream Job
            <span className="flex items-center gap-2 sm:gap-6">
              and get
              <img
                src="/logo.png"
                className="h-14 sm:h-24 lg:h-32"
                alt="Hirrd Logo"
              />
            </span>
          </h1>
          
          <p className="text-gray-300 sm:mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Connect with top companies, discover exciting opportunities, and take your career to the next level. 
            Join thousands of professionals who found their perfect match.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 sm:mt-12">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-600 hover:border-blue-500 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 mb-4">
            <Briefcase className="w-8 h-8 text-blue-400 mx-auto" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">10K+</h3>
          <p className="text-gray-400">Active Jobs</p>
        </div>
        <div className="text-center">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 mb-4">
            <Users className="w-8 h-8 text-green-400 mx-auto" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">50K+</h3>
          <p className="text-gray-400">Job Seekers</p>
        </div>
        <div className="text-center">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 mb-4">
            <Building2 className="w-8 h-8 text-orange-400 mx-auto" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">5K+</h3>
          <p className="text-gray-400">Companies</p>
        </div>
        <div className="text-center">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 mb-4">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">95%</h3>
          <p className="text-gray-400">Success Rate</p>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Trusted by Leading Companies</h2>
        <p className="text-gray-400 mb-8">Join the network of top employers and talented professionals</p>
        
        <Carousel
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="flex gap-5 sm:gap-20 items-center">
            {companies.map(({ name, id, path }) => (
              <CarouselItem key={id} className="basis-1/3 lg:basis-1/6">
                <div className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <img
                    src={path}
                    alt={name}
                    className="h-9 sm:h-14 object-contain mx-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50 hover:border-blue-600/70 transition-all duration-300 hover:transform hover:scale-105">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="font-bold text-xl text-white">Smart Job Search</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Advanced AI-powered search to find jobs that perfectly match your skills and preferences.</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50 hover:border-green-600/70 transition-all duration-300 hover:transform hover:scale-105">
          <CardHeader>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-green-400" />
            </div>
            <CardTitle className="font-bold text-xl text-white">Easy Application</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Apply to multiple jobs with one click. Track your applications and get real-time updates.</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50 hover:border-purple-600/70 transition-all duration-300 hover:transform hover:scale-105">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="font-bold text-xl text-white">Global Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Access job opportunities from companies worldwide. Work remotely or relocate with ease.</p>
          </CardContent>
        </Card>
      </section>

      {/* For Job Seekers & Employers */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/30 border-cyan-700/50 hover:border-cyan-600/70 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="font-bold text-2xl text-white">For Job Seekers</CardTitle>
                <p className="text-cyan-300">Find your dream career</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Browse thousands of job listings</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Get personalized job recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Track application status in real-time</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Connect directly with recruiters</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/30 border-orange-700/50 hover:border-orange-600/70 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <CardTitle className="font-bold text-2xl text-white">For Employers</CardTitle>
                <p className="text-orange-300">Find the perfect talent</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Post jobs and reach millions</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Advanced candidate filtering</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Streamlined hiring process</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Analytics and hiring insights</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
        <p className="text-gray-400 mb-12">Join thousands of satisfied job seekers and employers</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">"Found my dream job within 2 weeks! The platform is incredibly user-friendly and the job recommendations were spot on."</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Amit Sharma</p>
                  <p className="text-gray-400 text-sm">Software Engineer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">"As a recruiter, this platform has revolutionized our hiring process. We found amazing talent quickly and efficiently."</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">P</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Priya Patel</p>
                  <p className="text-gray-400 text-sm">HR Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">"The best job portal I've used. Clean interface, relevant jobs, and excellent support team. Highly recommended!"</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">R</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Rahul Kumar</p>
                  <p className="text-gray-400 text-sm">Data Analyst</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know about our platform</p>
        </div>
        
        <Accordion type="multiple" className="w-full max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`} className="border-gray-700">
              <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-3xl p-12 border border-blue-700/30">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of professionals who have already found their perfect match. Your dream job is just one click away.
        </p>
        <Button 
          onClick={handleGetStarted}
          size="lg" 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Get Started Now <ArrowRight className="ml-2 w-6 h-6" />
        </Button>
      </section>
    </main>
  );
};

export default LandingPage;
