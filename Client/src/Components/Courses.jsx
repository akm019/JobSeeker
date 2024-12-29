import React from "react";

const Courses = () => {
  const courses = [
    {
      id: 1,
      name: "Data Structure and Algorithms",
      price: "Rs 800",
    },
    {
      id: 2,
      name: "Data Science Indepth Course",
      price: "Rs 800",
    },
    {
      id: 3,
      name: "Full Stack Web Development",
      price: "Rs 800",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">Courses</h1>

      {/* Courses Grid */}
      <div className="flex flex-wrap items-center justify-center gap-10">
        {courses.map((course) => (
          <div
            key={course.id}
            className="w-60 rounded-xl border shadow-md overflow-hidden flex flex-col"
          >
            {/* Upper Half with Gradient Background */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <h1 className="text-white text-lg font-bold text-center">{course.name}</h1>
            </div>

            {/* Lower Half with White Background */}
            <div className="bg-white p-4 flex flex-col items-center">
              <h2 className="text-gray-700 font-medium mb-2">Price: {course.price}</h2>
              <button className="bg-white border text-black py-2 px-4 rounded-lg font-semibold hover:border-black transition">
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
