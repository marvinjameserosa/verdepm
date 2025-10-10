import { BarChart3, Database, FileText, Smartphone, Users, Lock } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"

export const Features = () => {
    return (
            <section id="features" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              Everything You Need in One Platform
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Centralized Dashboard</CardTitle>
                <CardDescription>View project performance and ESG progress at a glance</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Automated Reports</CardTitle>
                <CardDescription>
                  Generate PDF and visual summaries ready for investor or auditor submission
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>Define permissions for Project Managers, Accountants, and Suppliers</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Data Backup & Security</CardTitle>
                <CardDescription>Secure storage with version control and access tracking</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Responsive Design</CardTitle>
                <CardDescription>Manage your projects anytime, on any device</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Compliance Ready</CardTitle>
                <CardDescription>Built-in templates for industry standards and regulations</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    )
}