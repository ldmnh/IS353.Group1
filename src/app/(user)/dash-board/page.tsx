"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { CardCourse } from "@/components"; // Import CardCourse
import Skeleton from "react-loading-skeleton"; // Import react-loading-skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Import css nếu cần
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PaginationC from "./paginationc";

export default function ProfilePage() {
  const { data: session, status } = useSession(); // Lấy thông tin session
  const router = useRouter(); // Dùng router để chuyển hướng

  // State để lưu các khóa học
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  const [personalizedCourses, setPersonalizedCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);

  // Loading states for different course categories
  const [loadingPopular, setLoadingPopular] = useState<boolean>(true);
  const [loadingPersonalized, setLoadingPersonalized] = useState<boolean>(true);
  const [loadingCompleted, setLoadingCompleted] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // useEffect(() => {
  //   const params = new URLSearchParams();
  //   if (keyword) {
  //     params.set("keyword", keyword);
  //   }
  //   if (page) {
  //     params.set("page", page.toString());
  //   }

  //   // Update the URL with only the relevant query params (keyword, page)
  //   router.push(`?${params.toString()}`, { scroll: false });
  // }, [keyword, page]);

  // Fetch dữ liệu cho 4 mục
  useEffect(() => {
    if (status === "loading") return; // Chờ khi loading
    if (!session) {
      router.push("/login"); // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    } else {
      console.log(session);
      // Fetch dữ liệu nếu người dùng đã đăng nhập
      const fetchPersonalizedCourses = async () => {
        try {
          setLoading(true);
          // Fetch popular courses
          const popularResponse = await fetch("/api/courses/popularity", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const popularData = await popularResponse.json();
          setPopularCourses(popularData.data);
          setLoadingPopular(true);
          // Fetch personalized courses
          const personalizedResponse = await fetch(
            "/api/courses/personalized",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const personalizedData = await personalizedResponse.json();
          setPersonalizedCourses(personalizedData.data);
          setLoadingPersonalized(false);
          // Fetch completed courses
          const completedResponse = await fetch("/api/courses/completed", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const completedData = await completedResponse.json();
          setCompletedCourses(completedData.data);
          setLoadingCompleted(false);
          const totalPages = Math.ceil(completedData.data.length / 8);
          setTotalPages(totalPages);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
          setLoadingPersonalized(false);
        }
      };
      fetchPersonalizedCourses();
    }
  }, [session, status, router, page]);

  // Nếu session đang loading hoặc người dùng chưa đăng nhập, không render content
  if (status === "loading" || !session) {
    return (
      <div className="h-[400px] text-[30px] items-center">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-center py-4">
        <div className="bg-white w-full h-[302px] rounded-[18px] shadow-lg p-6">
          <div className="space-y-1">
            <h4 className="text-[32px] text-[#5271FF] font-medium leading-none">
              Dash Board
            </h4>
            <p className="text-[22px] pt-[12px]">
              Discover your study progress
            </p>
          </div>
          <Separator className="my-4" />

          {/* Main flex container with even distribution of space */}
          <div className="flex  justify-between text-sm">
            {/* First column */}
            <div className="flex flex-col items-left space-y-4">
              <div className="text-[24px]">Completed Courses</div>
              <div className="text-[32px] pt-[32px] pb-[24px]">
                {completedCourses?.length}
              </div>
              <button
                className="text-blue-500 text-[16px] mt-2 hover:underline text-left"
                onClick={() => {
                  // Scroll đến phần tử mục tiêu, ví dụ: cuộn đến phần "completed-courses"
                  const target = document.getElementById("completed-courses");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}>
                See all
              </button>
            </div>

            {/* Vertical Separator */}
            <Separator
              orientation="vertical"
              className="h-[100px] w-[1px] bg-gray-300 mx-4" // Added fixed height and width
            />

            {/* Second column */}
            <div className="flex flex-col items-left space-y-4">
              <div className="text-[24px]">Personalize Courses</div>
              <div className="text-[32px] pt-[32px] pb-[24px]">
                {personalizedCourses?.length}+
              </div>
              <button
                className="text-blue-500 text-[16px] mt-2 hover:underline text-left"
                onClick={() => {
                  const target = document.getElementById(
                    "personalized-courses"
                  );
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}>
                See all
              </button>
            </div>

            {/* Vertical Separator */}
            <Separator
              orientation="vertical"
              className="h-[100px] w-[1px] bg-gray-300 mx-4" // Added fixed height and width
            />

            {/* Third column */}
            <div className="flex flex-col items-left space-y-4">
              <div className="text-[24px]">Popular Courses</div>
              <div className="text-[32px] pt-[32px] pb-[24px]">
                {popularCourses?.length}+
              </div>
              <Link
                href="/explore"
                className="text-blue-500 text-[16px] mt-2 hover:underline">
                See all
              </Link>
            </div>

            {/* Vertical Separator */}
            <Separator
              orientation="vertical"
              className="h-[100px] w-[1px] bg-gray-300 mx-4" // Added fixed height and width
            />

            {/* Fourth column */}
            <div className="flex flex-col items-left space-y-4">
              <div className="text-[24px] pr-[200px]">All Courses</div>
              <div className="text-[32px] pt-[32px] pb-[24px]">
                {popularCourses?.length}+
              </div>
              <Link
                href="/search"
                className="text-blue-500 text-[16px] mt-2 hover:underline">
                See all
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div>
        {/*Completed Courses*/}
        <div id="completed-courses" className="w-full">
          <h4 className="text-[32px] text-[#5271FF] font-medium leading-none pt-[30px] pb-[30px]">
            Completed Courses
          </h4>
          <div className=" ">
            {loadingCompleted ? (
              <div className="grid grid-cols-4 gap-4 ">
                {/* Hiển thị 4 Skeletons riêng biệt */}
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
              </div>
            ) : completedCourses.length > 0 ? (
              <div>
                <div className="grid grid-cols-4 gap-4">
                  {completedCourses
                    .slice((page - 1) * 8, page * 8)
                    .map((course, index) => (
                      <CardCourse
                        key={`course card ${index}`}
                        course={course}
                      />
                    ))}
                </div>
                <div className="pt-[30px] pb-[30px] w-full text-center">
                  <PaginationC
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                  />
                </div>
              </div>
            ) : (
              <p>No completed courses available at the moment.</p>
            )}
          </div>
        </div>
        {/* Personalized Courses */}
        <div id="personalized-courses">
          <h4 className="text-[32px] text-[#5271FF] font-medium leading-none pt-[30px] pb-[30px]">
            Personalized Courses
          </h4>
          <div className="">
            {loadingPersonalized ? (
              <div className="grid grid-cols-4 gap-4 ">
                {/* Hiển thị 4 Skeletons riêng biệt */}
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom " />
              </div>
            ) : personalizedCourses?.length > 0 ? (
              <div className="w-full">
                <div className="relative">
                  {/* Swiper with custom navigation buttons */}
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={15}
                    slidesPerView={4}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    pagination={{ clickable: true }}
                    autoplay={{
                      delay: 2000,
                      disableOnInteraction: false,
                    }}
                    loop={true}>
                    {popularCourses.slice(0, 20).map((course, index) => (
                      <SwiperSlide key={index}>
                        <CardCourse course={course} />
                      </SwiperSlide>
                    ))}
                    <div className="swiper-button-next"></div>
                    <div className="swiper-button-prev"></div>
                  </Swiper>
                </div>
                <Link
                  href="/explore"
                  className="text-blue-500 text-[16px] mt-2 hover:underline flex items-center space-x-2 justify-center pb-[50px] pt-[30px]">
                  See more
                  <ChevronRight className="ml-2 w-[24px] h-[24px] stroke-1" />
                </Link>
              </div>
            ) : (
              <p>
                No personalized courses available at the moment.&nbsp;
                {/* <Link href="/login" className="underline text-[#5271FF]">
                  Log in right now
                </Link> */}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* What Is Your Next? */}
      <div className="w-full pt-[20px]">
        <div
          className="bg-[#11009E] left-0 top-0 w-full h-auto p-6"
          style={{ width: "100% !important" }}>
          <h4 className="text-[32px] text-white font-semibold leading-none pb-[30px]">
            What Is Your Next?
          </h4>
          <div className="">
            {loadingCompleted ? (
              <div className="grid grid-cols-4 gap-4 ">
                {/* Hiển thị 4 Skeletons riêng biệt */}
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom w-full" />
                <Skeleton height={350} className="skeleton-custom " />
              </div>
            ) : popularCourses?.length > 0 ? (
              <div className="w-full">
                <div className="relative">
                  {/* Swiper with custom navigation buttons */}
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={15}
                    slidesPerView={4}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    pagination={{ clickable: true }}
                    autoplay={{
                      delay: 2000,
                      disableOnInteraction: false,
                    }}
                    loop={true}>
                    {popularCourses.slice(0, 20).map((course, index) => (
                      <SwiperSlide key={index}>
                        <CardCourse course={course} />
                      </SwiperSlide>
                    ))}
                    <div className="swiper-button-next"></div>
                    <div className="swiper-button-prev"></div>
                  </Swiper>
                </div>
                <Link
                  href="/search"
                  className="text-white text-[16px] mt-2 hover:underline flex items-center space-x-2 justify-center pb-[5px] pt-[30px]">
                  See more
                  <ChevronRight className="ml-2 w-[24px] h-[24px] stroke-1" />
                </Link>
              </div>
            ) : (
              <p>No next courses available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Ví dụ khi người dùng chưa đăng nhập thì không truy cập vào dash-broad
// "use client";

// import { useEffect } from "react";
// import { useSession, signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { signOut } from "next-auth/react";

// const DashBoard = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   console.log("Session:", session);
//   console.log("Status:", status);

//   useEffect(() => {
//     if (status === "loading") return;
//     if (!session) {
//       router.push("/login");
//     }
//   }, [session, status, router]);

//   if (!session) {
//     return <div>Redirecting to login...</div>;
//   }

//   return (
//     <div>
//       <h1>Welcome to your dashboard, {session.user?.name}</h1>

//       <button onClick={() => signOut({ callbackUrl: "/login" })}>
//         Log out
//       </button>
//     </div>
//   );
// };

// export default DashBoard;
