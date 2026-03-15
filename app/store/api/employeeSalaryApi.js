import { apiSlice } from "../apiSlice";

export const employeeSalaryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEmployeeSalaries: builder.query({
            query: ({ employee_id, start_date, end_date, token }) => ({
                url: `/employee-salaries?employee_id=${employee_id || ""}&start_date=${start_date || ""}&end_date=${end_date || ""}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            providesTags: ["EmployeeSalaries"],
        }),

        createEmployeeSalary: builder.mutation({
            query: ({ payload, token }) => ({
                url: "/employee-salaries",
                method: "POST",
                body: payload,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            invalidatesTags: ["EmployeeSalaries"],
        }),

        updateEmployeeSalary: builder.mutation({
            query: ({ id, payload, token }) => ({
                url: `/employee-salaries/${id}`,
                method: "PUT",
                body: payload,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            invalidatesTags: ["EmployeeSalaries"],
        }),

        deleteEmployeeSalary: builder.mutation({
            query: ({ id, token }) => ({
                url: `/employee-salaries/${id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            invalidatesTags: ["EmployeeSalaries"],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetEmployeeSalariesQuery,
    useCreateEmployeeSalaryMutation,
    useUpdateEmployeeSalaryMutation,
    useDeleteEmployeeSalaryMutation,
} = employeeSalaryApi;
