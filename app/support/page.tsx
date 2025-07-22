"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTheme } from "next-themes";
import { Mail, Phone, MessageSquare, FileText, ArrowRight } from "lucide-react";

export default function SupportPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitting(false);
      setFormSubmitted(true);
    }, 1000);
  };
  
  return (
    <div className={`min-h-[calc(100vh-4rem)] ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support Center</h1>
          <p className={`text-lg mb-8 max-w-xl text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Get help with CheetahType. Find answers to common questions or contact our support team.
          </p>
          </div>
          
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : 'text-slate-900'}>
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Find answers to the most common questions about CheetahType.
                </CardDescription>
              </CardHeader>
              <CardContent>
            <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className={isDark ? 'border-slate-700' : 'border-slate-200'}>
                    <AccordionTrigger className={isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                      How is my typing speed calculated?
                    </AccordionTrigger>
                    <AccordionContent className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      Your typing speed is calculated in words per minute (WPM), where one word is standardized as 5 characters. 
                      We measure the number of correct characters you type and divide by 5 to get the word count. 
                      This is then divided by the time elapsed in minutes to calculate your WPM.
                </AccordionContent>
              </AccordionItem>
              
                  <AccordionItem value="item-2" className={isDark ? 'border-slate-700' : 'border-slate-200'}>
                    <AccordionTrigger className={isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                      How do I track my progress over time?
                    </AccordionTrigger>
                    <AccordionContent className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      To track your progress, create an account and sign in. CheetahType will automatically save your 
                      test results and provide statistics and graphs showing your improvement over time in your profile page.
                </AccordionContent>
              </AccordionItem>
              
                  <AccordionItem value="item-3" className={isDark ? 'border-slate-700' : 'border-slate-200'}>
                    <AccordionTrigger className={isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                      How do I join a multiplayer race?
                    </AccordionTrigger>
                    <AccordionContent className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      To join a multiplayer race, navigate to the Multiplayer section and either create a new lobby or 
                      join an existing one with the lobby ID. You can invite friends by sharing the lobby ID with them.
                </AccordionContent>
              </AccordionItem>
              
                  <AccordionItem value="item-4" className={isDark ? 'border-slate-700' : 'border-slate-200'}>
                    <AccordionTrigger className={isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                      Can I customize the typing test?
                    </AccordionTrigger>
                    <AccordionContent className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      Yes, CheetahType offers various customization options. You can change the test duration, 
                      choose between different word counts, enable punctuation or numbers mode, select different themes, 
                      and even use your own custom text. Access these options through the settings menu.
                </AccordionContent>
              </AccordionItem>
              
                  <AccordionItem value="item-5" className={isDark ? 'border-slate-700' : 'border-slate-200'}>
                    <AccordionTrigger className={isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                      Is CheetahType free to use?
                    </AccordionTrigger>
                    <AccordionContent className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      Yes, CheetahType is completely free to use with all core features available to everyone. 
                      We may introduce premium features in the future, but the basic typing test and statistics 
                      will always remain free.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
              </CardContent>
              <CardFooter className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} pt-4`}>
                <div className="flex flex-wrap gap-4 w-full">
                  <Button variant="outline" className="flex items-center" asChild>
                    <a href="/docs/getting-started/">
                      <FileText className="mr-2 h-4 w-4" />
                      Documentation
                    </a>
                  </Button>
                  <Button variant="outline" className="flex items-center" asChild>
                    <a href="/guides/">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Typing Guides
                    </a>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div className="order-1 lg:order-2">
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : 'text-slate-900'}>
                  Contact Support
                </CardTitle>
                <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Send us a message and we&apos;ll get back to you soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formSubmitted ? (
                  <div className="flex flex-col items-center py-4">
                    <div className={`rounded-full p-3 mb-4 ${isDark ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                      <MessageSquare className={`h-6 w-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                    </div>
                    <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Message Received!
                    </h3>
                    <p className={`text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Thanks for reaching out. Our team will get back to you within 24-48 hours.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setFormSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Name</Label>
                      <Input 
                        id="name" 
                        required 
                        className={isDark 
                          ? 'bg-slate-700 border-slate-600 text-slate-200' 
                          : 'bg-white border-slate-200 text-slate-900'
                        } 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        className={isDark 
                          ? 'bg-slate-700 border-slate-600 text-slate-200' 
                          : 'bg-white border-slate-200 text-slate-900'
                        } 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Subject</Label>
                      <Input 
                        id="subject" 
                        required 
                        className={isDark 
                          ? 'bg-slate-700 border-slate-600 text-slate-200' 
                          : 'bg-white border-slate-200 text-slate-900'
                        } 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Message</Label>
                      <Textarea 
                        id="message" 
                        rows={5} 
                        required 
                        className={isDark 
                          ? 'bg-slate-700 border-slate-600 text-slate-200' 
                          : 'bg-white border-slate-200 text-slate-900'
                        } 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} pt-4`}>
                <div className="flex flex-col w-full space-y-3">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Alternative contact methods:</p>
                  <div className="flex items-center">
                    <Mail className={`h-4 w-4 mr-2 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                    <a 
                      href="mailto:support@CheetahType.com" 
                      className={`text-sm ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                    >
                      support@CheetahType.com
                    </a>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 