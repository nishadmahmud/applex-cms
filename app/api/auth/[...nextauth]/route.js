import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOption = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "text",
          required: true,
          placeholder: "Enter your Email",
        },
        password: {
          label: "Password",
          type: "password",
          required: true,
          placeholder: "Enter your Password",
        },
      },

      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) return null;

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API}/user-login`,
            { email, password }
          );

          const data = await response.data;

          if (data?.status === "success") {
            const employee = data?.employee || null;

            // ✅ Compact employee object (only required fields)
            const employeeDetails = employee
              ? {
                  id: employee.id,
                  employee_id: employee.employee_id,
                  emp_image: employee.emp_image,
                  name: employee.name,
                  joining_date: employee.joining_date,
                  email: employee.email,
                  mobile_number: employee.mobile_number,
                  relation_with: employee.relation_with,
                  dob: employee.dob,
                  work_email: employee.work_email,
                  warehouse_id: employee.warehouse_id,
                  department_id: employee.department_id,
                  designation_id: employee.designation_id,
                  role_id: employee.role_id,
                  role: {
                    id: employee.role?.id,
                    name: employee.role?.name,
                    description: employee.role?.description,
                  },
                }
              : null;

            // ✅ Return everything needed for session creation.
            return {
              ...data.user,
              accessToken: data.authorisation.token,
              pinVerified: false,
              isEmployee: !!employee,
              employeeId: employee?.id || null,
              roleId: employee?.role_id || null,
              employee: employeeDetails, // 🔹 store compact info in session
            };
          }
          return null;
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.user = user;
        token.pinVerified = user.pinVerified;
        token.isEmployee = user.isEmployee || false; // ✅ add employee flag
        token.employee = user.employee || null; // ✅ keep basic employee data
      }

      // Handle session updates (this is the key part you were missing!)
      if (trigger === "update" && session) {
        // Update the token with new session data
        token.user = { ...token.user, ...session.user };
        if (session.pinVerified !== undefined) {
          token.pinVerified = session.pinVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      session.pinVerified = token.pinVerified;
      session.isEmployee = token.isEmployee || false; // ✅ expose to session
      session.employee = token.employee || null; // ✅ expose employee info
      return session;
    },
  },
};

const handler = NextAuth(authOption);

export { handler as GET, handler as POST };
