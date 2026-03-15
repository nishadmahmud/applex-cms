import { apiSlice } from "../apiSlice";

const employeesAPi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        getEmployees : builder.query({
            query : () => '/employee',
            invalidatesTags : ['Employees']
        }),
        searchEmployee : builder.query({
            query : (keyword) => ({
                url : 'search-employee?page=1&limit=15',
                method : 'POST',
                body : keyword
            })
        })
    })
})


export const {useGetEmployeesQuery,useLazySearchEmployeeQuery} = employeesAPi;