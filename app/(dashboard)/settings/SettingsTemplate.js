/* eslint-disable react/prop-types */
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { List, Plus } from "lucide-react";
import ListSkeleton from "./ListSkeleton";
import dynamic from "next/dynamic";
import ActionButtons from "./@panel/brands/ActionButtons";
import React from 'react'
const ProfileSection = dynamic(() => import('./ProfileSection'),{ssr : false})

const SettingsTemplate = ({
  isLoading,
  data,
  session,
  formHref = "",
  type,
  haveList = true,
  customComponent: CustomComponent,
  customActions,
  // New modal props
  onAddClick,
  showAddButton = true,
  addButtonText = "ADD NEW",
  columns = null,
  headerTitle = "Settings",
  showProductListButton = true,
  showProfileSection = true,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=" border-b border-gray-200 px-6 py-4 mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {headerTitle}
            </h1>
          </div>
          <div className="flex space-x-3">
            {showAddButton && (
              <>
                {formHref ? (
                  // Original functionality - redirect to another route
                  <Link href={formHref}>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      {addButtonText}
                    </Button>
                  </Link>
                ) : onAddClick ? (
                  // New functionality - open modal
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={onAddClick}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addButtonText}
                  </Button>
                ) : null}
              </>
            )}

            {showProductListButton && (
              <Link href="/products">
                <Button variant="outline">
                  <List className="w-4 h-4 mr-2" />
                  PRODUCT LIST
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className=" mx-auto px-6 py-8 space-y-8">
        {/* Profile Section */}
        {showProfileSection && <ProfileSection />}
        {/* Data rendering Section */}
        {haveList ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Items</h3>
            </div>

            {/* Check if columns are provided for table layout */}
            {columns && columns.length > 0 ? (
              // Table Layout for multiple columns
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {columns.map((column, index) => (
                        <th
                          key={index}
                          className={`text-left py-3 px-4 font-medium text-gray-900 ${
                            column.width || ""
                          }`}
                        >
                          {column.header}
                        </th>
                      ))}
                      {(customActions ||
                        (type !== "subcategory" && session?.accessToken)) && (
                        <th className="text-right py-3 px-4 font-medium text-gray-900">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading || !data ? (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          <ListSkeleton total={10} />
                        </td>
                      </tr>
                    ) : data?.length ? (
                      data.map((item, rowIndex) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          {columns.map((column, colIndex) => (
                            <td key={colIndex} className="py-3 px-4">
                              {column.render ? (
                                column.render(item, rowIndex)
                              ) : column.accessor ? (
                                <div>
                                  {column.accessor
                                    .split(".")
                                    .reduce((obj, key) => obj?.[key], item)}
                                </div>
                              ) : (
                                item[column.key]
                              )}
                            </td>
                          ))}
                          {(customActions ||
                            (type !== "subcategory" &&
                              session?.accessToken)) && (
                            <td className="py-3 px-4 text-right">
                              {customActions ? (
                                customActions(item)
                              ) : (
                                <ActionButtons
                                  type={type}
                                  id={item.id}
                                  token={session.accessToken}
                                />
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="py-8 text-center text-gray-500"
                        >
                          No Item Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // Original List Layout for single column
              <div className="space-y-4">
                {isLoading || !data ? (
                  <ListSkeleton total={10} />
                ) : data?.length ? (
                  data.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{item.flag}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Use custom actions if provided, otherwise use default ActionButtons */}
                      {customActions ? (
                        customActions(item)
                      ) : type === "subcategory" ? (
                        ""
                      ) : (
                        <ActionButtons
                          type={type}
                          id={item.id}
                          token={session.accessToken}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <p>No Item Available</p>
                )}
              </div>
            )}
          </Card>
        ) : (
          <>
            {/* Custom Component Section (when haveList is false) */}
            {!haveList && CustomComponent && <CustomComponent />}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsTemplate;
