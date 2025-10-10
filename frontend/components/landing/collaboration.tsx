import { BarChart3, CheckCircle2, Mail, Users } from "lucide-react";

export const Collaboration = () => {
    return (
      <section className="py-20 sm:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                  Connect Every Stakeholder in One Portal
                </h2>
                <p className="text-lg text-primary-foreground/90 leading-relaxed">
                  No more scattered spreadsheets or email chains. VerdePM's Project Portal lets you collaborate
                  seamlessly.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Invite team members and suppliers via email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Assign roles and access permissions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Track task completion and compliance milestones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Share progress reports instantly</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur rounded-2xl p-8 border border-primary-foreground/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-primary-foreground/10 rounded-lg">
                    <Mail className="h-8 w-8" />
                    <div>
                      <p className="font-semibold">Instant Invitations</p>
                      <p className="text-sm text-primary-foreground/80">Add team members in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-primary-foreground/10 rounded-lg">
                    <Users className="h-8 w-8" />
                    <div>
                      <p className="font-semibold">Role Management</p>
                      <p className="text-sm text-primary-foreground/80">Control access levels</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-primary-foreground/10 rounded-lg">
                    <BarChart3 className="h-8 w-8" />
                    <div>
                      <p className="font-semibold">Real-Time Updates</p>
                      <p className="text-sm text-primary-foreground/80">Everyone stays in sync</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };