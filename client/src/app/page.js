'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon, Users, ChartPieIcon, MessageSquare, BarChart3, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../app/components/Navbar';

// Components
import {Button} from '../app/components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };

  const fadeInUpVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 15, 
        stiffness: 100 
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Head>
        <title>FlowCRM | Streamline Your Customer Relationships</title>
        <meta name="description" content="A modern CRM solution for growing businesses" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/75 dark:bg-gray-950/75 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            
          </motion.div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col lg:flex-row items-center justify-between gap-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="flex-1 max-w-2xl" variants={itemVariants}>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text mb-6">
                  Relationships flow <br />better with FlowCRM
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                  Transform customer interactions into lasting connections. Our AI-powered CRM helps you understand, engage, and grow your customer base effortlessly.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-6 px-8">
                    Start Free Trial
                  </Button>
                  
                  <Button variant="outline" className="border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 text-lg py-6 px-8 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                      <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" />
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex-1 relative"
                variants={itemVariants}
              >
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl"></div>
                  <motion.div 
                    className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 overflow-hidden"
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">Customer Overview</h3>
                        <div className="flex space-x-2">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-20 bg-blue-100 dark:bg-blue-900/30 rounded-lg"></div>
                          <div className="h-20 bg-purple-100 dark:bg-purple-900/30 rounded-lg"></div>
                        </div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 rounded-full bg-blue-500"></div>
                          <div className="flex-1">
                            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUpVariants}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why businesses choose FlowCRM</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Our platform is designed to solve real business challenges through intuitive features that adapt to your workflow.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "360° Customer Profiles",
                  description: "Get a complete view of each customer's journey, preferences, and interactions in one unified dashboard.",
                  icon: <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
                  delay: 0
                },
                {
                  title: "AI-Powered Insights",
                  description: "Leverage machine learning to predict customer needs and identify opportunities for growth and engagement.",
                  icon: <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
                  delay: 0.1
                },
                {
                  title: "Smart Communications",
                  description: "Automate personalized outreach across channels while maintaining the human touch your customers value.",
                  icon: <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
                  delay: 0.2
                },
                {
                  title: "Performance Analytics",
                  description: "Track key metrics and visualize your team's performance with customizable dashboards and reports.",
                  icon: <BarChart3 className="h-8 w-8 text-teal-600 dark:text-teal-400" />,
                  delay: 0.3
                },
                {
                  title: "Seamless Integrations",
                  description: "Connect with the tools you already use, from email marketing platforms to help desk solutions.",
                  icon: <ChartPieIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
                  delay: 0.4
                },
                {
                  title: "Mobile Accessibility",
                  description: "Access your CRM anytime, anywhere with our responsive design and dedicated mobile application.",
                  icon: <BarChart3 className="h-8 w-8 text-rose-600 dark:text-rose-400" />,
                  delay: 0.5
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUpVariants}
                  transition={{ delay: feature.delay }}
                >
                  <Card className="h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUpVariants}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by teams worldwide</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                See how FlowCRM is transforming how businesses connect with their customers.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "FlowCRM has transformed how we manage relationships. The AI suggestions have increased our engagement rates by 37%.",
                  author: "Sarah Johnson",
                  role: "Sales Director, TechVision Inc.",
                  image: "/api/placeholder/64/64"
                },
                {
                  quote: "The intuitive interface made adoption a breeze. Our team was up and running in less than a day with minimal training.",
                  author: "Mark Thompson",
                  role: "Customer Success Manager, GrowthLabs",
                  image: "/api/placeholder/64/64"
                },
                {
                  quote: "We've consolidated three separate tools into just FlowCRM, saving us thousands annually while improving our workflow.",
                  author: "Elena Rodríguez",
                  role: "Operations Lead, Foundry Group",
                  image: "/api/placeholder/64/64"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUpVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                      <div className="flex items-center">
                        <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4" />
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUpVariants}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Choose the plan that works best for your business needs.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Starter",
                  price: "$19",
                  description: "Perfect for solopreneurs and small businesses just getting started.",
                  features: [
                    "Up to 1,000 contacts",
                    "Basic email automation",
                    "Standard reporting",
                    "Mobile app access",
                    "Email support"
                  ],
                  cta: "Get Started",
                  highlighted: false
                },
                {
                  title: "Professional",
                  price: "$49",
                  description: "Ideal for growing teams that need more advanced features.",
                  features: [
                    "Up to 10,000 contacts",
                    "Advanced automation workflows",
                    "Custom dashboards",
                    "API access",
                    "Priority support",
                    "Team collaboration tools"
                  ],
                  cta: "Start Free Trial",
                  highlighted: true
                },
                {
                  title: "Enterprise",
                  price: "$99",
                  description: "For organizations requiring premium features and dedicated support.",
                  features: [
                    "Unlimited contacts",
                    "AI-powered predictions",
                    "Advanced security",
                    "Dedicated account manager",
                    "Custom integrations",
                    "24/7 phone support"
                  ],
                  cta: "Contact Sales",
                  highlighted: false
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUpVariants}
                  transition={{ delay: index * 0.1 }}
                  className={index === 1 ? "-mt-4 mb-4" : ""}
                >
                  <Card className={`h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300 ${
                    plan.highlighted ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
                  }`}>
                    <CardHeader>
                      {plan.highlighted && (
                        <div className="py-1 px-3 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium rounded-full w-fit mb-2">
                          Most Popular
                        </div>
                      )}
                      <CardTitle className="text-xl">{plan.title}</CardTitle>
                      <div className="flex items-baseline mt-2">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                      </div>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={`w-full ${
                          plan.highlighted 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white max-w-5xl mx-auto relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUpVariants}
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-blue-600 opacity-20 mix-blend-multiply"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your customer relationships?</h2>
                <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of businesses using FlowCRM to drive growth through better customer relationships.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 text-lg py-6 px-8">
                    Start Your Free Trial
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg py-6 px-8">
                    Schedule a Demo 
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                FlowCRM
              </span>
            </div>
            
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FlowCRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}