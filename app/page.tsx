"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

type Bookmark = {
  id: string;
  title: string;
  url: string;
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // ================= AUTH =================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ================= FETCH BOOKMARKS =================
  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
  };

  // ================= REALTIME =================
  useEffect(() => {
    if (!session) return;

    fetchBookmarks();

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // ================= ADD BOOKMARK =================
  const addBookmark = async () => {
    if (!title || !url) return;

    let formattedUrl = url;

    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl;
    }

    await supabase.from("bookmarks").insert([
      {
        user_id: session?.user.id,
        title,
        url: formattedUrl,
      },
    ]);

    setTitle("");
    setUrl("");

    fetchBookmarks();
  };

  // ================= DELETE BOOKMARK =================
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks();
  };

  // ================= LOGIN =================
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return null;

  // ================= LOGIN SCREEN =================
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
        <button
          onClick={login}
          className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-8 py-4 rounded-2xl text-lg shadow-xl"
        >
          🔐 Sign in with Google
        </button>
      </div>
    );
  }

  // ================= MAIN UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-700">
            📚 Welcome {session.user.email}
          </h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg shadow-md"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark Section */}
        <div className="mb-8 bg-indigo-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-lg font-semibold text-indigo-600 mb-4">
            Add New Bookmark
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none px-3 py-2 rounded-lg flex-1"
            />
            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none px-3 py-2 rounded-lg flex-1"
            />
            <button
              onClick={addBookmark}
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2 rounded-lg shadow-md"
            >
              Add
            </button>
          </div>
        </div>

        {/* Bookmark List */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <p className="text-gray-500 text-center">
              No bookmarks added yet.
            </p>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition p-5 rounded-xl flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg text-gray-800">
                  {bookmark.title}
                </h2>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline text-sm"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-1 rounded-lg shadow-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





