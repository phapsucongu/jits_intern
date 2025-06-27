import usePing from '../hooks/usePing';
export const Homepage = () => {
    const { data, loading, error } = usePing();
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error.message}</div>;
    return (
        <>
            <div>
                <h1>Welcome to My CMS</h1>
                <p>Ping response: {data.message}</p>
            </div>
        </>
    );
}