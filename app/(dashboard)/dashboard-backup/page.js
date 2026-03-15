import React from "react";
import { DashboardStats } from "./DashboardStats";
import ProfitChart from "./ProfitChart";
import YearlyStats from "./YearlyStats";
import MonthlyEarnings from "./MonthlyEarnings";
import EmployeeSalaryStats from "./EmployeeSalaryStats";
import CustomerStats from "./CustomerStats";
import ProjectsStats from "./ProjectsStats";
import BestSellingStats from "./BestSellingStats";
import Notification from "./Notification";
import WeeklyStats from "./WeeklyStats";
import TopProjects from "./TopProjects";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <DashboardStats />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <ProfitChart />
        </div>
        <div className="flex flex-col gap-8">
          <YearlyStats />
          <MonthlyEarnings />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div>
          <EmployeeSalaryStats />
        </div>
        <div className="grid grid-cols-2  gap-5">
          <CustomerStats />
          <ProjectsStats />
          <div className="col-span-full">
            <Notification />
          </div>
        </div>
        <div>
          <BestSellingStats />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8 pb-10">
        <WeeklyStats />
        <TopProjects />
      </div>
    </div>
  );
}
